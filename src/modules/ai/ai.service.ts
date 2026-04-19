import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { StatementService } from '../statement/statement.service';
import { ScoreService } from '../score/score.service';
import { TopicService } from '../topic/topic.service';
import { CreateScoreDto } from '../score/dto/create-score.dto';
import { ScoreStatus } from '../score/entities/score.entity';
import { StatementStatus } from '../statement/entities/statement.entity';

export interface StanceAnalysisResult {
  extracted_quote: string;
  topic_code: string;
  score_value: number;
  confidence: number;
  justification: string;
  evidence_quote: string;
  reasoning: Record<string, any>;
}

export interface ExtractedStatement {
  text: string;
  context: string;
  type: 'policy_position' | 'promise' | 'claim' | 'prediction';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiApiUrl: string;
  private readonly aiApiKey: string;

  constructor(
    private httpService: HttpService,
    private statementService: StatementService,
    private scoreService: ScoreService,
    private topicService: TopicService,
  ) {
    this.aiApiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.aiApiKey = process.env.AI_API_KEY || '';
  }

  /**
   * Main entry point: Analyze a statement and generate scores
   * Implements the "Granular Scoring" constraint - scores per extracted statement, not whole text
   */
  async analyzeStatement(statementId: number): Promise<void> {
    const statement = await this.statementService.findOne(statementId);
    
    // Step 1: Parse text into individual statements/gzarahs
    const extractedStatements = await this.extractStatements(
      statement.original_text,
      statement.context,
    );

    // Step 2: For each extracted statement, match to topic and score
    for (const extracted of extractedStatements) {
      const analysis = await this.analyzeStance(extracted);
      
      if (analysis) {
        // Find topic by code
        const topic = await this.topicService.findByCode(analysis.topic_code);
        
        if (topic) {
          // Create score record
          const scoreDto: CreateScoreDto = {
            score_value: analysis.score_value,
            confidence: analysis.confidence,
            justification: analysis.justification,
            evidence_quote: analysis.evidence_quote,
            ai_reasoning: analysis.reasoning,
            person_id: statement.person_id,
            statement_id: statement.id,
            topic_id: topic.id,
          };

          await this.scoreService.create(scoreDto);
        }
      }
    }

    // Update statement status
    await this.statementService.update(statementId, {
      status: StatementStatus.SCORED,
      ai_analysis: JSON.stringify(extractedStatements),
    });

    this.logger.log(`Statement ${statementId} analyzed with ${extractedStatements.length} extracted stances`);
  }

  /**
   * Extract individual statements (gazarahs) from full text
   * Constraint: "Granular Scoring" - each gazarah gets its own score
   */
  private async extractStatements(text: string, context?: string): Promise<ExtractedStatement[]> {
    const systemPrompt = `You are an expert political text analyzer for the "Dideban" system.
Your task is to extract individual, explicit policy statements ("gazarahs") from the given text.

CRITICAL RULES (System Constraints):
1. Extract ONLY explicit statements - do NOT infer intent or read between lines
2. Each extracted statement must be a direct quote or close paraphrase
3. If the text contains multiple positions, extract each separately
4. Classify each as: policy_position, promise, claim, or prediction
5. Return ONLY the explicit text, no interpretation

Output format: JSON array of objects with fields:
- text: The exact or closely paraphrased statement
- context: Brief surrounding context (1 sentence)
- type: One of [policy_position, promise, claim, prediction]`;

    const userPrompt = `Text to analyze:\n${text}\n${context ? `\nAdditional context: ${context}` : ''}`;

    try {
      const response = await this.callAiApi(systemPrompt, userPrompt);
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to extract statements', error);
      // Fallback: treat whole text as one statement
      return [{ text, context: '', type: 'policy_position' }];
    }
  }

  /**
   * Analyze a single statement and match to topic coding manual
   * Constraint: "Intent Neutrality" - only explicit text, no guessing intent
   */
  private async analyzeStance(statement: ExtractedStatement): Promise<StanceAnalysisResult | null> {
    const systemPrompt = `You are a strict political stance analyzer for "Dideban".
Your task is to:
1. Match the statement to the most relevant topic from the coding manual
2. Assign a score (0-5) based on the coding manual criteria
3. Provide evidence quote showing exactly which text led to this score

CRITICAL RULES (Intent Neutrality):
- NEVER use phrases like "seems like", "probably means", "appears to suggest"
- If the text is ambiguous or lacks explicit stance, return null
- You MUST cite the exact evidence quote that justifies the score
- Score ONLY based on explicit statement content, not speaker's history or implied meaning

CODING MANUAL EXAMPLES:
Topic: currency_management (ارز)
- Score 5: "Government must fully control all currency exchange"
- Score 3: "Balanced approach with some government oversight"
- Score 0: "Complete free market, no government intervention"

Output format: JSON object with:
{
  "topic_code": "topic identifier",
  "score_value": 0-5,
  "confidence": 0.0-1.0,
  "justification": "One sentence explaining WHY this score was given",
  "evidence_quote": "Exact quote from text that justifies the score",
  "reasoning": { "key": "value" pairs for any additional analysis }
}

If no clear stance can be determined, return: null`;

    const userPrompt = `Statement to analyze:\n${statement.text}\n\nType: ${statement.type}\nContext: ${statement.context || 'N/A'}`;

    try {
      const response = await this.callAiApi(systemPrompt, userPrompt);
      const result = JSON.parse(response);
      
      // Validate result
      if (result && result.score_value !== undefined && result.evidence_quote) {
        return {
          ...result,
          extracted_quote: statement.text,
        };
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to analyze stance', error);
      return null;
    }
  }

  /**
   * Detect contradictions between statements
   */
  async detectContradictions(personId: number): Promise<Array<{statement1: number, statement2: number, topicId: number, explanation: string}>> {
    const systemPrompt = `You are a contradiction detection specialist for "Dideban".
Analyze the provided statements and identify any contradictions in policy positions.

A contradiction exists when:
1. Same person takes opposite positions on same topic
2. Positions are mutually exclusive (not just nuanced differences)
3. There's clear evidence in the text

Output format: JSON array of contradictions:
{
  "contradictions": [
    {
      "statement1_id": number,
      "statement2_id": number,
      "topic_code": string,
      "explanation": "Clear explanation of the contradiction"
    }
  ]
}`;

    // Get recent statements for this person
    const statements = await this.statementService.findAll(personId, StatementStatus.SCORED);
    
    if (statements.length < 2) return [];

    const statementsData = statements.map(s => ({
      id: s.id,
      text: s.original_text,
      topic_id: s.topic_id,
      speech_date: s.speech_date,
    }));

    const userPrompt = `Analyze these statements for contradictions:\n${JSON.stringify(statementsData, null, 2)}`;

    try {
      const response = await this.callAiApi(systemPrompt, userPrompt);
      const result = JSON.parse(response);
      return result.contradictions || [];
    } catch (error) {
      this.logger.error('Failed to detect contradictions', error);
      return [];
    }
  }

  /**
   * Calculate personality radar scores (6 dimensions)
   */
  async calculatePersonalityRadar(personId: number, statements: any[]): Promise<Record<string, number>> {
    const systemPrompt = `Analyze the speaker's communication style and personality traits.
Score on 6 dimensions (0-10 scale):

1. aggressive_vs_collaborative: Direct confrontation vs diplomatic language
2. local_vs_global: National focus vs international perspective
3. reformist_vs_conservative: Change-oriented vs tradition-preserving
4. transparent_vs_vague: Clear specifics vs ambiguous language
5. rational_vs_emotional: Data-driven vs emotional appeals
6. formal_vs_informal: Official tone vs casual/populist language

Output: JSON object with 6 dimension scores (0-10)`;

    const sampleStatements = statements.slice(0, 10).map(s => s.original_text).join('\n---\n');
    
    try {
      const response = await this.callAiApi(systemPrompt, sampleStatements);
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to calculate personality radar', error);
      return {
        aggressive_vs_collaborative: 5,
        local_vs_global: 5,
        reformist_vs_conservative: 5,
        transparent_vs_vague: 5,
        rational_vs_emotional: 5,
        formal_vs_informal: 5,
      };
    }
  }

  /**
   * Generic API call to AI service
   */
  private async callAiApi(systemPrompt: string, userPrompt: string): Promise<string> {
    // For now, use a mock implementation if no API key
    if (!this.aiApiKey) {
      this.logger.warn('No AI API key configured, returning mock response');
      return this.getMockResponse(systemPrompt);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.aiApiUrl,
          {
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3, // Lower temperature for more consistent results
          },
          {
            headers: {
              Authorization: `Bearer ${this.aiApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return (response as any).data.choices[0].message.content;
    } catch (error) {
      this.logger.error('AI API call failed', error);
      throw error;
    }
  }

  /**
   * Mock response for testing without API key
   */
  private getMockResponse(systemPrompt: string): string {
    if (systemPrompt.includes('extract individual')) {
      return JSON.stringify([
        { text: 'Sample extracted statement', context: 'Context', type: 'policy_position' }
      ]);
    }
    if (systemPrompt.includes('stance analyzer')) {
      return JSON.stringify({
        topic_code: 'economy_currency',
        score_value: 3,
        confidence: 0.8,
        justification: 'Mock justification',
        evidence_quote: 'Mock evidence',
        reasoning: {},
      });
    }
    if (systemPrompt.includes('contradiction detection')) {
      return JSON.stringify({ contradictions: [] });
    }
    if (systemPrompt.includes('personality')) {
      return JSON.stringify({
        aggressive_vs_collaborative: 5,
        local_vs_global: 5,
        reformist_vs_conservative: 5,
        transparent_vs_vague: 5,
        rational_vs_emotional: 5,
        formal_vs_informal: 5,
      });
    }
    return '{}';
  }
}
