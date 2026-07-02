const {
  recommendBySubjects,
  getAvailableYears,
  getScoreAnalysisHistory,
  getScoreAnalysisById,
  recommendByScore,
  recommendByHolland,
} = require("../services/recommend.service");
const quotaService = require("../services/quota.service");

exports.recommendSubjects = async (req, res) => {
  try {
    const { scores, filters, pagination, year, countUsage } = req.body;
    const userId = req.user?.id || null;
    const page = pagination?.page || 1;
    // Chỉ tính 1 lượt khi là tìm kiếm MỚI (trang đầu). Đổi năm để xem lại điểm
    // (countUsage === false) hoặc bấm "Xem thêm" (page > 1) KHÔNG tính lượt.
    const isCounting = page === 1 && countUsage !== false;
    console.log(`[Recommend] userId=${userId}, page=${page}, year=${year}, counting=${isCounting}`);

    // Guest logic: 1 free trial (chỉ chặn khi thực sự tính lượt)
    if (!userId) {
      const guestTrial = req.cookies?.guest_trial;
      if (isCounting && guestTrial) {
        return res.status(403).json({
          status: "error",
          message:
            "Bạn đã hết lượt dùng thử miễn phí. Vui lòng đăng nhập để tiếp tục!",
          code: "QUOTA_EXCEEDED",
        });
      }
    } else if (isCounting) {
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
      userId || null,
      scores,
      filters,
      pagination,
      { year, saveHistory: isCounting && !!userId },
    );

    if (!userId) {
      if (isCounting) {
        res.cookie("guest_trial", "true", {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }
    } else if (isCounting) {
      await quotaService.incrementQuota(userId, "recommendations");
    }

    return res.status(200).json({
      status: "success",
      data: {
        ...result,
        totalResults: result.total,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// Danh sách năm có dữ liệu điểm chuẩn (dùng cho bộ chọn năm ở FE)
exports.getYears = async (req, res) => {
  try {
    const availableYears = await getAvailableYears();
    return res.status(200).json({
      status: "success",
      data: { availableYears, latestYear: availableYears[0] || null },
    });
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

exports.getAnalysisDetail = async (req, res) => {
  try {
    const record = await getScoreAnalysisById(req.params.id, req.user.id);
    if (!record) {
      return res.status(404).json({ status: "error", message: "Không tìm thấy bản ghi." });
    }
    return res.status(200).json({ status: "success", data: record });
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
    const userId = req.user?.id;
    if (!userId) {
      const used = req.cookies?.guest_trial ? 1 : 0;
      return res.status(200).json({
        status: "success",
        data: { plan: "GUEST", limit: 1, used, remaining: 1 - used },
      });
    }
    const quota = await quotaService.getQuota(userId, "recommendations");
    return res.status(200).json({ status: "success", data: quota });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
