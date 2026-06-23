const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });

const universityImages = {
  "Đại học FPT":
    "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1000&auto=format&fit=crop",
  "Đại học Tài chính - Marketing":
    "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=1000&auto=format&fit=crop",
  "Đại học Sư phạm Kỹ thuật TP.HCM":
    "https://images.unsplash.com/photo-1592280771195-a6976a97337a?q=80&w=1000&auto=format&fit=crop",
  "Đại học Y Dược TP.HCM":
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop",
  "Đại học Kinh tế Quốc dân":
    "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=1000&auto=format&fit=crop",
  "Đại học Quốc gia TP.HCM":
    "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=1000&auto=format&fit=crop",
  "Học viện Bưu chính Viễn thông":
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop",
  "Đại học RMIT Việt Nam":
    "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=1000&auto=format&fit=crop",
  "Đại học Y Hà Nội":
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop",
  "Đại học Bách khoa - ĐHQG TP.HCM":
    "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1000&auto=format&fit=crop",
  "Đại học Tôn Đức Thắng":
    "https://images.unsplash.com/photo-1592280771195-a6976a97337a?q=80&w=1000&auto=format&fit=crop",
  "Đại học Ngoại thương":
    "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=1000&auto=format&fit=crop",
  "Học viện Tài chính":
    "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=1000&auto=format&fit=crop",
  "Đại học Kinh tế TP.HCM (UEH)":
    "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1000&auto=format&fit=crop",
  "Đại học Bách khoa Hà Nội":
    "https://images.unsplash.com/photo-1592280771195-a6976a97337a?q=80&w=1000&auto=format&fit=crop",
  "Học viện Ngân hàng":
    "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=1000&auto=format&fit=crop",
  "Đại học Nguyễn Tất Thành":
    "https://images.unsplash.com/photo-1523050853063-915894691067?q=80&w=1000&auto=format&fit=crop",
  "Đại học Quốc gia Hà Nội":
    "https://images.unsplash.com/photo-1562774053-701939374587?q=80&w=1000&auto=format&fit=crop",
  "Đại học Công nghệ - ĐHQGHN":
    "https://images.unsplash.com/photo-1592280771195-a6976a97337a?q=80&w=1000&auto=format&fit=crop",
  "Đại học Kinh tế - Luật (UEL)":
    "https://images.unsplash.com/photo-1541339907198-e08756edd81f?q=80&w=1000&auto=format&fit=crop",
};

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const universities = await mongoose.connection.db
      .collection("universities")
      .find({})
      .toArray();
    let updatedCount = 0;

    for (const uni of universities) {
      const newImage = universityImages[uni.name];
      if (newImage) {
        await mongoose.connection.db
          .collection("universities")
          .updateOne({ _id: uni._id }, { $set: { image: newImage } });
        updatedCount++;
      }
    }

    console.log(
      `Successfully updated images for ${updatedCount} universities.`,
    );
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error updating images:", err);
    process.exit(1);
  }
}

updateImages();
