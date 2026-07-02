const University = require("../models/university.model");
const Major = require("../models/major.model");
const UniversityMajor = require("../models/universityMajor.model");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// --- Thống kê tổng quan (dùng cho 4 thẻ ở trang Quản lý Ngành/Trường) ---

exports.getManagementStats = async (req, res) => {
  try {
    const [totalUniversities, totalMajors, totalLinks, needsUpdateCount, locations] =
      await Promise.all([
        University.countDocuments({ isDeleted: { $ne: true } }),
        Major.countDocuments({ isDeleted: { $ne: true } }),
        UniversityMajor.countDocuments({ isDeleted: { $ne: true } }),
        // Trường chưa có ảnh bìa (coverImage) cho trang chi tiết => cần bổ sung dữ liệu
        University.countDocuments({
          isDeleted: { $ne: true },
          $or: [{ coverImage: { $exists: false } }, { coverImage: "" }, { coverImage: null }],
        }),
        University.distinct("location", { isDeleted: { $ne: true } }),
      ]);

    res.status(200).json({
      status: "success",
      data: {
        totalUniversities,
        totalMajors,
        totalLinks,
        needsUpdateCount,
        locations: locations.filter(Boolean).sort((a, b) => a.localeCompare(b, "vi")),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- University Management ---

exports.getUniversities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();
    const location = req.query.location || "";
    const type = req.query.type || "";

    const query = { isDeleted: { $ne: true } };
    if (search) {
      const escaped = escapeRegex(search);
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { location: { $regex: escaped, $options: "i" } },
        { address: { $regex: escaped, $options: "i" } },
        { website: { $regex: escaped, $options: "i" } },
      ];
    }
    if (location) query.location = location;
    if (type) query.type = type;

    const total = await University.countDocuments(query);
    const universities = await University.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    // Cờ "cần cập nhật" — trường chưa có ảnh bìa cho trang chi tiết
    const withFlags = universities.map((u) => {
      const obj = u.toObject();
      obj.needsUpdate = !obj.coverImage;
      return obj;
    });

    res.status(200).json({
      status: "success",
      data: {
        universities: withFlags,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createUniversity = async (req, res) => {
  try {
    const university = await University.create(req.body);
    res.status(201).json({ status: "success", data: university });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ status: "error", message: "Tên trường này đã tồn tại trong hệ thống." });
    }
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.updateUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!university)
      return res
        .status(404)
        .json({ status: "error", message: "University not found" });
    res.status(200).json({ status: "success", data: university });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ status: "error", message: "Tên trường này đã tồn tại trong hệ thống." });
    }
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    if (university) {
      // Xóa trường thì các liên kết Ngành-Trường của nó cũng phải "biến mất" theo,
      // nếu không tab Liên kết sẽ vẫn hiện các dòng trỏ tới 1 trường đã bị xóa.
      const mappings = await UniversityMajor.find({
        university: req.params.id,
        isDeleted: { $ne: true },
      });
      await UniversityMajor.updateMany(
        { university: req.params.id },
        { isDeleted: true, deletedAt: new Date() },
      );
      const majorIds = [...new Set(mappings.map((m) => String(m.major)))];
      await Promise.all(
        majorIds.map((majorId) =>
          Major.findByIdAndUpdate(majorId, {
            $pull: { universities: req.params.id },
          }),
        ),
      );
    }
    res
      .status(200)
      .json({ status: "success", message: "University deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- Major Management ---

exports.getMajors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const query = { isDeleted: { $ne: true } };
    if (search) {
      const escaped = escapeRegex(search);
      query.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        { code: { $regex: escaped, $options: "i" } },
      ];
    }

    const total = await Major.countDocuments(query);
    const majors = await Major.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        majors,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createMajor = async (req, res) => {
  try {
    const major = await Major.create(req.body);
    res.status(201).json({ status: "success", data: major });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.updateMajor = async (req, res) => {
  try {
    const major = await Major.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!major)
      return res
        .status(404)
        .json({ status: "error", message: "Major not found" });
    res.status(200).json({ status: "success", data: major });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.deleteMajor = async (req, res) => {
  try {
    const major = await Major.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    if (major) {
      await UniversityMajor.updateMany(
        { major: req.params.id },
        { isDeleted: true, deletedAt: new Date() },
      );
    }
    res
      .status(200)
      .json({ status: "success", message: "Major deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- University-Major Mapping Management ---

exports.getUniversityMajors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();
    const universityId = req.query.university || "";
    const majorId = req.query.major || "";

    const query = { isDeleted: { $ne: true } };
    if (universityId) query.university = universityId;
    if (majorId) query.major = majorId;

    if (search) {
      const escaped = escapeRegex(search);
      // find() không tìm được trực tiếp trên field đã populate,
      // nên phải tìm trước ID của trường/ngành khớp từ khóa rồi $in vào query chính.
      const uniMatches = await University.find({
        name: { $regex: escaped, $options: "i" },
      }).select("_id");
      const majorMatches = await Major.find({
        name: { $regex: escaped, $options: "i" },
      }).select("_id");

      query.$or = [
        { university: { $in: uniMatches.map((u) => u._id) } },
        { major: { $in: majorMatches.map((m) => m._id) } },
      ];
    }

    const total = await UniversityMajor.countDocuments(query);
    const universityMajors = await UniversityMajor.find(query)
      .populate("university")
      .populate("major")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: {
        universityMajors,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createUniversityMajor = async (req, res) => {
  try {
    const { university, major } = req.body;
    const existing = await UniversityMajor.findOne({
      university,
      major,
      isDeleted: { $ne: true },
    });
    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "Liên kết giữa trường và ngành này đã tồn tại.",
      });
    }

    const universityMajor = await UniversityMajor.create(req.body);
    // Đồng bộ ngược lại Major.universities để không bị lệch dữ liệu
    await Major.findByIdAndUpdate(major, { $addToSet: { universities: university } });

    res.status(201).json({ status: "success", data: universityMajor });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.updateUniversityMajor = async (req, res) => {
  try {
    const old = await UniversityMajor.findById(req.params.id);
    if (!old) {
      return res.status(404).json({
        status: "error",
        message: "UniversityMajor mapping not found",
      });
    }

    const universityMajor = await UniversityMajor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    const newUniversity = req.body.university || String(old.university);
    const newMajor = req.body.major || String(old.major);
    if (
      String(newMajor) !== String(old.major) ||
      String(newUniversity) !== String(old.university)
    ) {
      await Major.findByIdAndUpdate(old.major, {
        $pull: { universities: old.university },
      });
      await Major.findByIdAndUpdate(newMajor, {
        $addToSet: { universities: newUniversity },
      });
    }

    res.status(200).json({ status: "success", data: universityMajor });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.deleteUniversityMajor = async (req, res) => {
  try {
    const mapping = await UniversityMajor.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    if (mapping) {
      await Major.findByIdAndUpdate(mapping.major, {
        $pull: { universities: mapping.university },
      });
    }
    res.status(200).json({
      status: "success",
      message: "UniversityMajor mapping deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
