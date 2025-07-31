import { storage } from "../storage";
import type { SkinAnalysis } from "@shared/schema";

export interface ProgressMetrics {
  overallImprovement: number;
  timespan: string;
  concernsResolved: string[];
  concernsImproved: string[];
  concernsWorsened: string[];
  newConcerns: string[];
  recommendations: string[];
  milestones: ProgressMilestone[];
}

export interface ProgressMilestone {
  date: Date;
  score: number;
  majorChanges: string[];
  notes: string;
}

export interface ComparisonResult {
  before: SkinAnalysis;
  after: SkinAnalysis;
  timeframe: {
    start: Date;
    end: Date;
    duration: string;
  };
  scoreChange: {
    absolute: number;
    percentage: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  concernAnalysis: {
    resolved: string[];
    improved: string[];
    stable: string[];
    worsened: string[];
    new: string[];
  };
  recommendations: string[];
}

export class ProgressTrackingEngine {
  
  async getProgressMetrics(userId: number): Promise<ProgressMetrics> {
    try {
      const analyses = await storage.getSkinAnalyses(userId);
      
      if (analyses.length < 2) {
        throw new Error('At least 2 analyses required for progress tracking');
      }

      // Sort by date (most recent first)
      analyses.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

      const latest = analyses[0];
      const baseline = analyses[analyses.length - 1];

      const metrics = this.calculateProgressMetrics(baseline, latest, analyses);
      return metrics;
    } catch (error) {
      console.error('Progress metrics error:', error);
      throw new Error('Failed to calculate progress metrics');
    }
  }

  async compareAnalyses(userId: number, analysisId1: number, analysisId2: number): Promise<ComparisonResult> {
    try {
      const analysis1 = await storage.getSkinAnalysis(analysisId1);
      const analysis2 = await storage.getSkinAnalysis(analysisId2);

      if (!analysis1 || !analysis2) {
        throw new Error('One or both analyses not found');
      }

      if (analysis1.userId !== userId || analysis2.userId !== userId) {
        throw new Error('Unauthorized access to analyses');
      }

      // Ensure chronological order (analysis1 = earlier, analysis2 = later)
      const [before, after] = this.sortAnalysesByDate(analysis1, analysis2);

      return this.generateComparison(before, after);
    } catch (error) {
      console.error('Analysis comparison error:', error);
      throw new Error('Failed to compare analyses');
    }
  }

  async getProgressTimeline(userId: number): Promise<any[]> {
    try {
      const analyses = await storage.getSkinAnalyses(userId);
      
      return analyses
        .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
        .map((analysis, index) => ({
          id: analysis.id,
          date: analysis.createdAt,
          score: analysis.progressScore,
          analysisType: analysis.analysisType,
          primaryConcerns: analysis.concerns?.slice(0, 3) || [],
          milestone: this.identifyMilestone(analysis, index, analyses.length),
          imageUrl: analysis.imageUrl
        }));
    } catch (error) {
      console.error('Timeline generation error:', error);
      throw new Error('Failed to generate progress timeline');
    }
  }

  async generateProgressReport(userId: number): Promise<any> {
    try {
      const metrics = await this.getProgressMetrics(userId);
      const timeline = await this.getProgressTimeline(userId);
      
      return {
        summary: {
          totalAnalyses: timeline.length,
          overallImprovement: metrics.overallImprovement,
          timespan: metrics.timespan,
          status: this.getProgressStatus(metrics.overallImprovement)
        },
        metrics,
        timeline,
        recommendations: this.generateProgressRecommendations(metrics.overallImprovement, metrics.concernsResolved, metrics.newConcerns),
        nextSteps: this.suggestNextSteps(metrics)
      };
    } catch (error) {
      console.error('Progress report error:', error);
      throw new Error('Failed to generate progress report');
    }
  }

  private calculateProgressMetrics(
    baseline: SkinAnalysis, 
    latest: SkinAnalysis, 
    allAnalyses: SkinAnalysis[]
  ): ProgressMetrics {
    const scoreChange = (latest.progressScore || 0) - (baseline.progressScore || 0);
    const timespan = this.calculateTimespan(baseline.createdAt!, latest.createdAt!);

    // Analyze concern changes
    const baselineConcerns = new Set(baseline.concerns || []);
    const latestConcerns = new Set(latest.concerns || []);

    const concernsResolved = Array.from(baselineConcerns).filter(c => !latestConcerns.has(c));
    const newConcerns = Array.from(latestConcerns).filter(c => !baselineConcerns.has(c));
    const persistingConcerns = Array.from(baselineConcerns).filter(c => latestConcerns.has(c));

    // Generate milestones
    const milestones = this.generateMilestones(allAnalyses);

    return {
      overallImprovement: scoreChange,
      timespan,
      concernsResolved,
      concernsImproved: this.identifyImprovedConcerns(baseline, latest),
      concernsWorsened: this.identifyWorsenedConcerns(baseline, latest),
      newConcerns,
      recommendations: this.generateProgressRecommendations(scoreChange, concernsResolved, newConcerns),
      milestones
    };
  }

  private generateComparison(before: SkinAnalysis, after: SkinAnalysis): ComparisonResult {
    const timeframe = {
      start: before.createdAt!,
      end: after.createdAt!,
      duration: this.calculateTimespan(before.createdAt!, after.createdAt!)
    };

    const scoreDiff = (after.progressScore || 0) - (before.progressScore || 0);
    const scoreChange = {
      absolute: scoreDiff,
      percentage: before.progressScore ? (scoreDiff / before.progressScore) * 100 : 0,
      trend: (scoreDiff > 5 ? 'improving' : scoreDiff < -5 ? 'declining' : 'stable') as 'improving' | 'stable' | 'declining'
    };

    const beforeConcerns = new Set(before.concerns || []);
    const afterConcerns = new Set(after.concerns || []);

    const concernAnalysis = {
      resolved: Array.from(beforeConcerns).filter(c => !afterConcerns.has(c)),
      new: Array.from(afterConcerns).filter(c => !beforeConcerns.has(c)),
      stable: Array.from(beforeConcerns).filter(c => afterConcerns.has(c)),
      improved: this.identifyImprovedConcerns(before, after),
      worsened: this.identifyWorsenedConcerns(before, after)
    };

    return {
      before,
      after,
      timeframe,
      scoreChange,
      concernAnalysis,
      recommendations: this.generateComparisonRecommendations(scoreChange.trend, concernAnalysis)
    };
  }

  private sortAnalysesByDate(analysis1: SkinAnalysis, analysis2: SkinAnalysis): [SkinAnalysis, SkinAnalysis] {
    const date1 = new Date(analysis1.createdAt!).getTime();
    const date2 = new Date(analysis2.createdAt!).getTime();
    
    return date1 <= date2 ? [analysis1, analysis2] : [analysis2, analysis1];
  }

  private calculateTimespan(start: Date, end: Date): string {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
    return `${Math.ceil(diffDays / 365)} years`;
  }

  private identifyImprovedConcerns(before: SkinAnalysis, after: SkinAnalysis): string[] {
    // This would require more detailed severity tracking
    // For now, return empty array - could be enhanced with severity comparison
    return [];
  }

  private identifyWorsenedConcerns(before: SkinAnalysis, after: SkinAnalysis): string[] {
    // Similar to above - would need severity tracking for accurate implementation
    return [];
  }

  private generateMilestones(analyses: SkinAnalysis[]): ProgressMilestone[] {
    return analyses
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
      .map((analysis, index) => ({
        date: analysis.createdAt!,
        score: analysis.progressScore || 0,
        majorChanges: this.identifyMajorChanges(analysis, analyses[index - 1]),
        notes: this.generateMilestoneNote(analysis, index, analyses.length)
      }));
  }

  private identifyMajorChanges(current: SkinAnalysis, previous?: SkinAnalysis): string[] {
    if (!previous) return ["Initial assessment"];

    const changes: string[] = [];
    const scoreDiff = (current.progressScore || 0) - (previous.progressScore || 0);

    if (scoreDiff > 10) changes.push("Significant improvement");
    if (scoreDiff < -10) changes.push("Concerning decline");

    const currentConcerns = new Set(current.concerns || []);
    const previousConcerns = new Set(previous.concerns || []);

    const resolved = Array.from(previousConcerns).filter(c => !currentConcerns.has(c));
    const newIssues = Array.from(currentConcerns).filter(c => !previousConcerns.has(c));

    if (resolved.length > 0) changes.push(`Resolved: ${resolved.join(', ')}`);
    if (newIssues.length > 0) changes.push(`New concerns: ${newIssues.join(', ')}`);

    return changes.length > 0 ? changes : ["Routine progress check"];
  }

  private generateMilestoneNote(analysis: SkinAnalysis, index: number, total: number): string {
    if (index === 0) return "Baseline assessment established";
    if (index === total - 1) return "Most recent progress check";
    
    const progress = ((index + 1) / total) * 100;
    if (progress <= 25) return "Early stage monitoring";
    if (progress <= 50) return "Mid-journey assessment";
    if (progress <= 75) return "Advanced progress tracking";
    return "Comprehensive long-term follow-up";
  }

  private identifyMilestone(analysis: SkinAnalysis, index: number, total: number): string {
    if (index === 0) return "baseline";
    if (index === total - 1) return "latest";
    if (analysis.progressScore && analysis.progressScore > 80) return "excellent";
    if (analysis.progressScore && analysis.progressScore > 60) return "good";
    return "monitoring";
  }

  private getProgressStatus(improvement: number): string {
    if (improvement > 20) return "Excellent Progress";
    if (improvement > 10) return "Good Progress";
    if (improvement > 0) return "Steady Improvement";
    if (improvement > -10) return "Stable Condition";
    return "Needs Attention";
  }

  private generateProgressRecommendations(
    scoreChange: number, 
    resolved: string[], 
    newConcerns: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (scoreChange > 10) {
      recommendations.push("Excellent progress! Continue your current routine");
      recommendations.push("Consider maintenance phase with current products");
    } else if (scoreChange > 0) {
      recommendations.push("Good improvement trend - stay consistent");
      recommendations.push("Consider adding targeted treatments for remaining concerns");
    } else if (scoreChange < -5) {
      recommendations.push("Regression detected - review routine with dermatologist");
      recommendations.push("Consider lifestyle factors affecting skin health");
    }

    if (resolved.length > 0) {
      recommendations.push(`Great job resolving: ${resolved.join(', ')}`);
    }

    if (newConcerns.length > 0) {
      recommendations.push(`Address new concerns: ${newConcerns.join(', ')}`);
    }

    return recommendations;
  }

  private generateComparisonRecommendations(
    trend: 'improving' | 'stable' | 'declining',
    concerns: any
  ): string[] {
    const recommendations: string[] = [];

    switch (trend) {
      case 'improving':
        recommendations.push("Continue current routine - it's working well");
        recommendations.push("Consider gradual introduction of anti-aging products");
        break;
      case 'stable':
        recommendations.push("Maintain consistency in your routine");
        recommendations.push("Consider seasonal adjustments or targeted treatments");
        break;
      case 'declining':
        recommendations.push("Schedule dermatologist consultation");
        recommendations.push("Review products for irritation or incompatibility");
        break;
    }

    if (concerns.resolved.length > 0) {
      recommendations.push("Celebrate resolved concerns - your routine is effective!");
    }

    if (concerns.new.length > 0) {
      recommendations.push("Address new concerns promptly to prevent progression");
    }

    return recommendations;
  }

  private suggestNextSteps(metrics: ProgressMetrics): string[] {
    const steps: string[] = [];

    if (metrics.overallImprovement > 15) {
      steps.push("Consider transitioning to maintenance routine");
      steps.push("Schedule quarterly progress photos");
    } else if (metrics.overallImprovement > 5) {
      steps.push("Continue current routine for 4-6 more weeks");
      steps.push("Take monthly progress photos");
    } else {
      steps.push("Evaluate routine effectiveness with professional");
      steps.push("Consider patch testing new products");
    }

    steps.push("Maintain consistent sleep and hydration");
    steps.push("Document any lifestyle changes affecting skin");

    return steps;
  }
}
