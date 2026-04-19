import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../person/entities/person.entity';
import { Score, ScoreStatus } from '../score/entities/score.entity';
import { Statement, StatementStatus } from '../statement/entities/statement.entity';
import { PersonService } from '../person/person.service';
import { ScoreService } from '../score/score.service';
import { StatementService } from '../statement/statement.service';
import { AiService } from '../ai/ai.service';

export interface AggregatedProfile {
  // Key Performance Indicators (KPIs)
  truth_score: number;           // 0-10: Truth-O-Meter
  stability_score: number;     // 0-10: Flip-Flop Index
  clarity_score: number;       // 0-10: Clarity Score
  populism_score: number;      // 0-10: Populism Index
  promise_completion_rate: number; // 0-100%: Promise Tracker

  // Radar Personality (6 dimensions: 0-10)
  radar_scores: {
    aggressive_vs_collaborative: number;
    local_vs_global: number;
    reformist_vs_conservative: number;
    transparent_vs_vague: number;
    rational_vs_emotional: number;
    formal_vs_informal: number;
  };

  // Topic Heatmap
  topic_scores: Record<string, number>; // topic_code -> average score

  // Trend data
  score_trends: Array<{
    topic_code: string;
    timeline: Array<{ date: Date; score: number }>;
  }>;

  // Latest contradiction
  latest_contradiction?: {
    statement1_id: number;
    statement2_id: number;
    topic_code: string;
    explanation: string;
    detected_at: Date;
  };

  // Statistics
  total_statements: number;
  total_promises: number;
  fulfilled_promises: number;
  pending_promises: number;
  expired_promises: number;

  // Metadata
  last_calculated_at: Date;
  calculation_version: string;
}

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    private personService: PersonService,
    private scoreService: ScoreService,
    private statementService: StatementService,
    private aiService: AiService,
  ) {}

  /**
   * Calculate and update the "Living Profile File" for a person
   * This implements the "Living Profile File" constraint from the spec
   */
  async calculateAggregatedProfile(personId: number): Promise<AggregatedProfile> {
    this.logger.log(`Calculating aggregated profile for person ${personId}`);

    // Fetch all relevant data
    const person = await this.personService.findOne(personId);
    const scores = await this.scoreService.findAll(personId);
    const statements = await this.statementService.findAll(personId, StatementStatus.SCORED);

    // Calculate KPIs
    const kpiScores = this.calculateKPIs(scores, statements);

    // Calculate topic heatmap
    const topicScores = this.calculateTopicScores(scores);

    // Calculate trend data
    const scoreTrends = this.calculateScoreTrends(scores);

    // Get personality radar
    const radarScoresRaw = await this.aiService.calculatePersonalityRadar(personId, statements);
    const radarScores = {
      aggressive_vs_collaborative: radarScoresRaw.aggressive_vs_collaborative || 5,
      local_vs_global: radarScoresRaw.local_vs_global || 5,
      reformist_vs_conservative: radarScoresRaw.reformist_vs_conservative || 5,
      transparent_vs_vague: radarScoresRaw.transparent_vs_vague || 5,
      rational_vs_emotional: radarScoresRaw.rational_vs_emotional || 5,
      formal_vs_informal: radarScoresRaw.formal_vs_informal || 5,
    };

    // Check for contradictions
    const contradictions = await this.aiService.detectContradictions(personId);
    const latestContradiction = contradictions.length > 0 ? {
      statement1_id: contradictions[0].statement1,
      statement2_id: contradictions[0].statement2,
      topic_code: contradictions[0].topicId.toString(),
      explanation: contradictions[0].explanation,
      detected_at: new Date(),
    } : undefined;

    // Promise statistics
    const promiseStats = this.calculatePromiseStats(statements);

    const aggregatedProfile: AggregatedProfile = {
      ...kpiScores,
      radar_scores: radarScores,
      topic_scores: topicScores,
      score_trends: scoreTrends,
      latest_contradiction: latestContradiction,
      ...promiseStats,
      last_calculated_at: new Date(),
      calculation_version: '1.0.0',
    };

    // Save to person entity
    await this.personService.updateAggregatedProfile(personId, {
      truth_score: aggregatedProfile.truth_score,
      stability_score: aggregatedProfile.stability_score,
      clarity_score: aggregatedProfile.clarity_score,
      populism_score: aggregatedProfile.populism_score,
      promise_completion_rate: aggregatedProfile.promise_completion_rate,
      total_statements: aggregatedProfile.total_statements,
      total_promises: aggregatedProfile.total_promises,
      fulfilled_promises: aggregatedProfile.fulfilled_promises,
      radar_scores: aggregatedProfile.radar_scores,
      topic_scores: aggregatedProfile.topic_scores,
      latest_contradiction: aggregatedProfile.latest_contradiction,
      personality_analysis: aggregatedProfile.radar_scores,
    });

    this.logger.log(`Profile calculated for person ${personId}`);
    return aggregatedProfile;
  }

  /**
   * Get cached profile (fast lookup)
   */
  async getProfile(personId: number): Promise<AggregatedProfile | null> {
    const person = await this.personService.findOne(personId);
    
    if (!person.aggregated_profile) {
      // Calculate on demand if not exists
      return this.calculateAggregatedProfile(personId);
    }

    return person.aggregated_profile as unknown as AggregatedProfile;
  }

  /**
   * Calculate Key Performance Indicators (KPIs)
   */
  private calculateKPIs(scores: Score[], statements: Statement[]) {
    // Truth Score: Average confidence of verified scores
    const verifiedScores = scores.filter(s => 
      s.status === ScoreStatus.HUMAN_VERIFIED || 
      s.status === ScoreStatus.HUMAN_OVERRIDDEN
    );
    const truthScore = verifiedScores.length > 0
      ? verifiedScores.reduce((acc, s) => acc + (s.confidence || 0), 0) / verifiedScores.length * 10
      : scores.length > 0
        ? scores.reduce((acc, s) => acc + (s.confidence || 0.5), 0) / scores.length * 10
        : 5;

    // Stability Score: Measure consistency over time
    const stabilityScore = this.calculateStabilityScore(scores);

    // Clarity Score: Percentage of statements with clear, specific language
    const clarityScore = this.calculateClarityScore(statements);

    // Populism Score: Based on AI analysis of language patterns
    // This is calculated separately by the AI service
    const populismScore = 5; // Placeholder

    // Promise Completion Rate
    const promises = statements.filter(s => s.statement_type === 'promise');
    const fulfilled = promises.filter(s => s.is_promise_fulfilled).length;
    const promiseCompletionRate = promises.length > 0
      ? (fulfilled / promises.length) * 100
      : 0;

    return {
      truth_score: Math.round(truthScore * 10) / 10,
      stability_score: Math.round(stabilityScore * 10) / 10,
      clarity_score: Math.round(clarityScore * 10) / 10,
      populism_score: Math.round(populismScore * 10) / 10,
      promise_completion_rate: Math.round(promiseCompletionRate * 10) / 10,
    };
  }

  /**
   * Calculate stability score based on score variance over time
   * High variance = low stability (frequent flip-flops)
   */
  private calculateStabilityScore(scores: Score[]): number {
    if (scores.length < 2) return 10; // Perfect stability with few scores

    // Group scores by topic
    const byTopic: Record<number, Score[]> = {};
    scores.forEach(s => {
      if (!byTopic[s.topic_id]) byTopic[s.topic_id] = [];
      byTopic[s.topic_id].push(s);
    });

    // Calculate variance per topic
    let totalVariance = 0;
    let topicCount = 0;

    Object.values(byTopic).forEach(topicScores => {
      if (topicScores.length >= 2) {
        const values = topicScores.map(s => s.score_value);
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        totalVariance += variance;
        topicCount++;
      }
    });

    // Convert variance to stability (0-10, where 10 = most stable)
    const avgVariance = topicCount > 0 ? totalVariance / topicCount : 0;
    const stability = Math.max(0, 10 - avgVariance * 2);
    return stability;
  }

  /**
   * Calculate clarity score based on statement analysis
   */
  private calculateClarityScore(statements: Statement[]): number {
    if (statements.length === 0) return 5;

    // Count statements with extracted quotes (clear, explicit statements)
    const clearStatements = statements.filter(s => 
      s.extracted_quote && s.extracted_quote.length > 10
    ).length;

    return (clearStatements / statements.length) * 10;
  }

  /**
   * Calculate average scores per topic for heatmap
   */
  private calculateTopicScores(scores: Score[]): Record<string, number> {
    const byTopic: Record<string, { sum: number; count: number }> = {};

    scores.forEach(score => {
      const topicCode = score.topic?.code || `topic_${score.topic_id}`;
      if (!byTopic[topicCode]) {
        byTopic[topicCode] = { sum: 0, count: 0 };
      }
      byTopic[topicCode].sum += score.score_value;
      byTopic[topicCode].count++;
    });

    const result: Record<string, number> = {};
    Object.entries(byTopic).forEach(([code, data]) => {
      result[code] = Math.round((data.sum / data.count) * 10) / 10;
    });

    return result;
  }

  /**
   * Calculate score trends over time for timeline charts
   */
  private calculateScoreTrends(scores: Score[]) {
    const byTopic: Record<string, Array<{ date: Date; score: number }>> = {};

    scores.forEach(score => {
      const topicCode = score.topic?.code || `topic_${score.topic_id}`;
      if (!byTopic[topicCode]) byTopic[topicCode] = [];
      
      byTopic[topicCode].push({
        date: score.created_at,
        score: score.score_value,
      });
    });

    return Object.entries(byTopic).map(([topic_code, timeline]) => ({
      topic_code,
      timeline: timeline.sort((a, b) => a.date.getTime() - b.date.getTime()),
    }));
  }

  /**
   * Calculate promise statistics
   */
  private calculatePromiseStats(statements: Statement[]) {
    const promises = statements.filter(s => s.statement_type === 'promise');
    const fulfilled = promises.filter(s => s.is_promise_fulfilled).length;
    const expired = promises.filter(s => 
      !s.is_promise_fulfilled && 
      s.promise_deadline && 
      s.promise_deadline < new Date()
    ).length;

    return {
      total_statements: statements.length,
      total_promises: promises.length,
      fulfilled_promises: fulfilled,
      pending_promises: promises.length - fulfilled - expired,
      expired_promises: expired,
    };
  }

  /**
   * Batch recalculate all profiles (for scheduled jobs)
   */
  async recalculateAllProfiles(): Promise<void> {
    const persons = await this.personService.findAll();
    
    for (const person of persons) {
      try {
        await this.calculateAggregatedProfile(person.id);
      } catch (error) {
        this.logger.error(`Failed to calculate profile for person ${person.id}`, error);
      }
    }
  }
}
