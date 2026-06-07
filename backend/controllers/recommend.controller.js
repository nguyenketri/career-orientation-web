const {
  recommendBySubjects,
  getScoreAnalysisHistory,
  recommendByScore,
  recommendByHolland,
} = require("../services/recommend.service");
const quotaService = require("../services/quota.service");

exports.recommendSubjects = async (req, res) => {
  try {
    const { scores, filters, pagination } = req.body;
    const userId = req.user.id;
    const page = pagination?.page || 1;

    // Only check and consume quota for the first page of results
    if (page === 1) {
      const hasQuota = await quotaService.checkQuota(userId, "recommendations");
      if (!hasQuota) {
        return res.status(403).json({
          status: "error",
          message:
            "Bạn đã hết lượt gợi ý cho hôm nay. Vui lòng nâng cấp gói để tiếp tục!",
          code: "QUOTA_EXCEEDED",
        });
      }
    }

    const result = await recommendBySubjects(
      userId,
      scores,
      filters,
      pagination,
    );

    if (page === 1) {
      await quotaService.incrementQuota(userId, "recommendations");
    }

    return res.status(200).json({ status: "success", data: result });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getAnalysisHistory = async (req, res) => {
  try {
    const history = await getScoreAnalysisHistory(req.user.id);
    return res.status(200).json({ status: "success", data: history });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.recommendScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const hasQuota = await quotaService.checkQuota(userId, "recommendations");
    if (!hasQuota) {
      return res.status(403).json({
        status: "error",
        message:
          "Bạn đã hết lượt gợi ý cho hôm nay. Vui lòng nâng cấp gói để tiếp tục!",
        code: "QUOTA_EXCEEDED",
      });
    }

    const data = await recommendByScore(req.body);
    await quotaService.incrementQuota(userId, "recommendations");

    return res.status(200).json({
      status: "success",
      message: "Recommend successfully",
      data,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.recommendHolland = async (req, res) => {
  try {
    const userId = req.user.id;
    const hasQuota = await quotaService.checkQuota(userId, "recommendations");
    if (!hasQuota) {
      return res.status(403).json({
        status: "error",
        message:
          "Bạn đã hết lượt gợi ý cho hôm nay. Vui lòng nâng cấp gói để tiếp tục!",
        code: "QUOTA_EXCEEDED",
      });
    }

    const data = await recommendByHolland(req.body);
    await quotaService.incrementQuota(userId, "recommendations");

    return res.status(200).json({
      status: "success",
      message: "Recommend successfully",
      data,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.getRecommendQuota = async (req, res) => {
  try {
    const quota = await quotaService.getQuota(req.user.id, "recommendations");
    return res.status(200).json({ status: "success", data: quota });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
