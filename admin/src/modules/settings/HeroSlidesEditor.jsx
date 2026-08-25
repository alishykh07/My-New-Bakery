import { useState } from "react";
import {
  Copy,
  Eye,
  GripVertical,
  Image,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function HeroSlidesEditor({
  slides,
  updateSlide,
  addSlide,
  removeSlide,
  duplicateSlide,
}) {
  const [uploading, setUploading] = useState(-1),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false),
    [savedMessage, setSavedMessage] = useState(""),
    [isDirty, setIsDirty] = useState(false);
  const markChanged = () => {
    setIsDirty(true);
    setSavedMessage("");
  };
  const changeSlide = (...args) => {
    markChanged();
    updateSlide(...args);
  };
  const createSlide = () => {
    markChanged();
    addSlide();
  };
  const deleteSlide = (index) => {
    markChanged();
    removeSlide(index);
  };
  const copySlide = (index) => {
    markChanged();
    duplicateSlide(index);
  };
  async function upload(index, file) {
    if (!file) return;
    setUploading(index);
    setError("");
    try {
      const body = new FormData();
      body.append("media", file);
      body.append("folder", "sliders");
      const response = await fetch(`${API}/admin/config/upload-media`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mnb_admin_token")}`,
        },
        body,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Upload failed");
      if (data.resourceType === "video") changeSlide(index, "video", data.url);
      else changeSlide(index, "image", data.url);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(-1);
    }
  }
  async function saveSlider() {
    if (!isDirty) return;
    setSaving(true);
    setError("");
    setSavedMessage("");
    try {
      const response = await fetch(`${API}/admin/config`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("mnb_admin_token")}`,
        },
        body: JSON.stringify({ heroSlides: slides }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Slider save failed");
      setIsDirty(false);
      setSavedMessage("Hero slider saved successfully.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <fieldset className="hero-editor">
      <div className="hero-editor-title">
        <div>
          <span>
            <Image size={15} />
          </span>
          <div>
            <legend>Home page Hero Slider</legend>
            <p>Add slides to showcase your bakery's best moments.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={createSlide}
          disabled={slides.length >= 4}
        >
          <Plus size={13} /> Add New Slide
        </button>
      </div>
      <div className="hero-slide-editor">
        {slides.map((slide, index) => (
          <article className="hero-slide-panel" key={index}>
            <GripVertical className="hero-drag" size={17} />
            <div className="hero-slide-image">
              <b>Slide {index + 1}</b>
              {slide.image ? (
                <img src={slide.image} alt={`Slide ${index + 1} preview`} />
              ) : slide.video ? (
                <video src={slide.video} muted />
              ) : (
                <div className="hero-empty-image">
                  <Image />
                  <span>No media</span>
                </div>
              )}
              <input
                id={`hero-media-${index}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                onChange={(event) => upload(index, event.target.files?.[0])}
              />
              <button
                type="button"
                disabled={uploading === index}
                onClick={() =>
                  document.getElementById(`hero-media-${index}`)?.click()
                }
              >
                {uploading === index ? (
                  <LoaderCircle className="spin" size={12} />
                ) : (
                  <Image size={12} />
                )}{" "}
                {uploading === index ? "Uploading..." : "Change Media"}
              </button>
            </div>
            <div className="hero-slide-fields">
              <div className="config-grid">
                <label>
                  Small Heading
                  <input
                    value={slide.eyebrow || ""}
                    onChange={(event) =>
                      changeSlide(index, "eyebrow", event.target.value)
                    }
                  />
                </label>
                <label>
                  Reveal Shape
                  <select
                    value={slide.shape || "circle"}
                    onChange={(event) =>
                      changeSlide(index, "shape", event.target.value)
                    }
                  >
                    {["circle", "flower", "hexagon", "square"].map((shape) => (
                      <option key={shape} value={shape}>
                        {shape[0].toUpperCase() + shape.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="wide">
                  Title
                  <input
                    value={slide.title || ""}
                    onChange={(event) =>
                      changeSlide(index, "title", event.target.value)
                    }
                  />
                </label>
                <label className="wide">
                  Description
                  <textarea
                    value={slide.description || ""}
                    onChange={(event) =>
                      changeSlide(index, "description", event.target.value)
                    }
                  />
                </label>
                <label className="wide hero-image-url">
                  Cloudinary Image URL
                  <input
                    id={`slide-image-${index}`}
                    value={slide.image || ""}
                    onChange={(event) =>
                      changeSlide(index, "image", event.target.value)
                    }
                  />
                </label>
                <label className="wide hero-video-url">
                  Cloudinary MP4 URL (optional)
                  <input
                    value={slide.video || ""}
                    onChange={(event) =>
                      changeSlide(index, "video", event.target.value)
                    }
                  />
                </label>
                <label>
                  Button Text
                  <input
                    value={slide.buttonText || ""}
                    onChange={(event) =>
                      changeSlide(index, "buttonText", event.target.value)
                    }
                  />
                </label>
                <label>
                  Button Link
                  <input
                    value={slide.buttonLink || ""}
                    onChange={(event) =>
                      changeSlide(index, "buttonLink", event.target.value)
                    }
                  />
                </label>
              </div>
            </div>
            <div className="hero-slide-actions">
              <button
                type="button"
                onClick={() =>
                  slide.image &&
                  window.open(slide.image, "_blank", "noopener,noreferrer")
                }
                disabled={!slide.image}
              >
                <Eye size={14} /> Preview
              </button>
              <button
                type="button"
                onClick={() => copySlide(index)}
                disabled={slides.length >= 4}
              >
                <Copy size={14} /> Duplicate
              </button>
              <button
                className="danger"
                type="button"
                onClick={() => deleteSlide(index)}
                disabled={slides.length <= 1}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      {error && <p className="hero-upload-error">{error}</p>}
      <div className="hero-editor-save">
        <span>
          {savedMessage || "Changes site par Save Slider ke baad show hongi."}
        </span>
        <button
          type="button"
          onClick={saveSlider}
          disabled={saving || !isDirty}
        >
          {saving ? <LoaderCircle className="spin" size={14} /> : null}
          {saving ? "Saving..." : "Save Slider"}
        </button>
      </div>
    </fieldset>
  );
}
