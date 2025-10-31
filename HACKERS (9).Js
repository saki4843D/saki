import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import Video from "./models/videoModel.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/collegetube")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Upload video
app.post("/api/upload", upload.single("video"), async (req, res) => {
  try {
    const video = new Video({
      title: req.body.title,
      module: req.body.module,
      faculty: req.body.faculty,
      filePath: req.file.path
    });
    await video.save();
    res.json({ message: "Video uploaded successfully", video });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading video" });
  }
});

// Get all videos
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching videos" });
  }
});

// Increment views
app.post("/api/videos/:id/view", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: "Error updating views" });
  }
});

// Increment likes
app.post("/api/videos/:id/like", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: "Error updating likes" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  module: String,
  faculty: String,
  filePath: String,
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Video", videoSchema);
import React, { useState, useRef } from "react";

function UploadForm({ onUpload }) {
  const [form, setForm] = useState({ title: "", module: "", faculty: "" });
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return alert("Please select a video file");

    const data = new FormData();
    data.append("title", form.title);
    data.append("module", form.module);
    data.append("faculty", form.faculty);
    data.append("video", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload", { method: "POST", body: data });
      if (!res.ok) throw new Error("Upload failed");
      onUpload();
      setForm({ title: "", module: "", faculty: "" });
      setFile(null);
      fileInputRef.current.value = null; // reset file input
    } catch (err) {
      console.error(err);
      alert("Error uploading video");
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <input name="title" placeholder="Video Title" value={form.title} onChange={handleChange} required />
      <input name="module" placeholder="Module" value={form.module} onChange={handleChange} required />
      <input name="faculty" placeholder="Faculty Name" value={form.faculty} onChange={handleChange} required />
      <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} ref={fileInputRef} required />
      <button type="submit">Upload</button>
    </form>
  );
}
import React from "react";

function VideoCard({ video }) {
  return (
    <div className="video-card">
      <h3>{video.title}</h3>
      <video width="400" controls>
        {/* The source URL assumes your backend is running on localhost:5000 */}
        <source src={`http://localhost:5000/${video.filePath}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p><strong>Module:</strong> {video.module}</p>
      <p><strong>Faculty:</strong> {video.faculty}</p>
      <p>Views: {video.views} | Likes: {video.likes}</p>
    </div>
  );
}

export default VideoCard;