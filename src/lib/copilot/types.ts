export interface BrandProfile {
  brandName: string;
  industry: string;
  persona: string; // 人设/语调
  targetAudience: string;
  contentStyle: string; // 内容风格偏好
  updatedAt: string;
}

export interface TopicRecommendation {
  title: string;
  reason: string; // 推荐理由
  angle: string; // 建议角度
  estimatedEngagement: 'high' | 'medium' | 'low';
  relatedSignals: string[]; // 相关新闻标题
}
