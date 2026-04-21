import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "@/redux/postSlice";
import { generateAICaptions, clearAIResults } from "@/redux/aiSlice";
import { Loader2, Sparkles, Mic, Square } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axiosInstance";
import { useSpeechRecognition, SPEECH_LANG_OPTIONS } from "@/hooks/useSpeechRecognition";
import "./CreatePost.css";
import "./VoiceInput.css";

const CreatePost = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const { loading: aiLoading, captions, hashtags } = useSelector((store) => store.ai);
  
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transformLoading, setTransformLoading] = useState(false);
  const [originalImage, setOriginalImage] = useState("");
  const [editedImage, setEditedImage] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [enhanceOn, setEnhanceOn] = useState(false);
  const [removeBgOn, setRemoveBgOn] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [transformedCache, setTransformedCache] = useState({});

  const FILTERS = [
    { key: "vintage", label: "Vintage" },
    { key: "bw", label: "B&W" },
    { key: "cinematic", label: "Cinematic" },
    { key: "warm", label: "Warm" },
  ];

  const getCaptionBase = useCallback(() => caption, [caption]);
  const onCaptionSpeechText = useCallback((text) => setCaption(text), []);

  const captionSpeech = useSpeechRecognition({
    getBaseText: getCaptionBase,
    onTextUpdate: onCaptionSpeechText,
    silenceMs: 3000,
  });

  const handleClose = () => {
    captionSpeech.stop();
    setOpen(false);
    setCaption("");
    setImage(null);
    setImagePreview(null);
    setOriginalImage("");
    setEditedImage("");
    setSelectedFilter("");
    setEnhanceOn(false);
    setRemoveBgOn(false);
    setCompareMode(false);
    setTransformedCache({});
    dispatch(clearAIResults());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image && !editedImage) return toast.error("Image is required");

    const formData = new FormData();
    formData.append("caption", caption);
    if (editedImage?.startsWith("http")) {
      formData.append("finalImageUrl", editedImage);
    } else if (image) {
      formData.append("image", image);
    }

    setLoading(true);
    try {
      await dispatch(addPost(formData)).unwrap();
      toast.success("Post created successfully!");
      handleClose();
    } catch (error) {
      console.error("Error creating post", error);
      toast.error(error || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    dispatch(clearAIResults());
    setSelectedFilter("");
    setEnhanceOn(false);
    setRemoveBgOn(false);
    setCompareMode(false);
    setTransformedCache({});
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setOriginalImage(reader.result);
        setEditedImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setOriginalImage("");
      setEditedImage("");
    }
  };

  const uploadTempToCloudinary = async () => {
    if (originalImage?.startsWith("http")) return originalImage;
    if (!image) {
      throw new Error("Please upload image first");
    }

    const payload = new FormData();
    payload.append("image", image);
    const res = await axiosInstance.post("/image/upload-temp", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const uploadedUrl = res.data?.imageUrl;
    if (!uploadedUrl) throw new Error("Failed to upload image for editing");
    setOriginalImage(uploadedUrl);
    if (!editedImage || editedImage.startsWith("data:")) {
      setEditedImage(uploadedUrl);
    }
    return uploadedUrl;
  };

  const buildPipeline = (next = {}) => {
    const pipeline = [];
    const rb = next.removeBgOn ?? removeBgOn;
    const en = next.enhanceOn ?? enhanceOn;
    const flt = next.selectedFilter ?? selectedFilter;

    // Best visual order: remove background → enhance → filter
    if (rb) pipeline.push("remove_bg");
    if (en) pipeline.push("enhance");
    if (flt) pipeline.push(flt);
    return pipeline;
  };

  const applyPipeline = async (nextState = {}) => {
    try {
      setTransformLoading(true);
      const baseUrl = await uploadTempToCloudinary();

      const pipeline = buildPipeline(nextState);
      if (!pipeline.length) {
        setEditedImage(baseUrl);
        return;
      }

      const cacheKey = pipeline.join("|");
      if (transformedCache[cacheKey]) {
        setEditedImage(transformedCache[cacheKey]);
        return;
      }

      const res = await axiosInstance.post("/image/transform", {
        imageUrl: baseUrl,
        transformations: pipeline,
      });
      const transformedUrl = res.data?.transformedUrl;
      if (!transformedUrl) throw new Error("Transformation failed");
      setTransformedCache((prev) => ({ ...prev, [cacheKey]: transformedUrl }));
      setEditedImage(transformedUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not transform image");
    } finally {
      setTransformLoading(false);
    }
  };

  const resetImageEdit = () => {
    if (!originalImage) return;
    setEnhanceOn(false);
    setRemoveBgOn(false);
    setSelectedFilter("");
    setEditedImage(originalImage);
    setTransformedCache({});
  };

  const handleAIButtonClick = async () => {
    if (!image) return toast.error("Please upload an image first");
    
    const formData = new FormData();
    formData.append("image", image);
    
    try {
      await dispatch(generateAICaptions(formData)).unwrap();
      toast.success("AI captions generated!");
    } catch (error) {
      toast.error(error || "AI generation failed");
    }
  };

  const selectCaption = (text) => {
    setCaption(text);
  };

  const appendHashtag = (tag) => {
    if (!caption.includes(tag)) {
      setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  if (!open) return null;

  const canPost = Boolean(image || editedImage?.startsWith("http"));

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header create-post-header">
          <h2>Create new post</h2>
          <div className="modal-header-actions">
            <button
              type="submit"
              form="create-post-form"
              className="btn-primary header-post-btn"
              disabled={loading || aiLoading || !canPost}
            >
              {loading ? "Posting..." : "Post"}
            </button>
            <button onClick={handleClose} className="modal-close-btn" aria-label="Close">&times;</button>
          </div>
        </div>
        
        <form id="create-post-form" onSubmit={handleSubmit} className="create-post-form-layout">
          <div className="modal-content post-creator-content">
            <div className="image-preview-section">
              {imagePreview ? (
                <div className={`createpost-preview-wrap ${compareMode ? "compare" : ""}`}>
                  <img
                    src={compareMode ? originalImage : editedImage || imagePreview}
                    alt="Preview"
                    className="createpost-img-preview"
                  />
                  {compareMode && (
                    <img src={editedImage || imagePreview} alt="Enhanced preview" className="createpost-img-preview" />
                  )}
                </div>
              ) : (
                <label className="image-upload-label">
                  <div className="upload-placeholder">
                    <Sparkles className="placeholder-icon" />
                    <span>Select from computer</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    disabled={loading || aiLoading}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            <div className="post-details-section">
              <div className="image-editor-tools">
                <button
                  type="button"
                  onClick={() => {
                    const next = !enhanceOn;
                    setEnhanceOn(next);
                    applyPipeline({ enhanceOn: next });
                  }}
                  disabled={!image || transformLoading || loading || aiLoading}
                  className={`editor-btn ${enhanceOn ? "active" : ""}`}
                >
                  ✨ Enhance
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = !removeBgOn;
                    setRemoveBgOn(next);
                    applyPipeline({ removeBgOn: next });
                  }}
                  disabled={!image || transformLoading || loading || aiLoading}
                  className={`editor-btn ${removeBgOn ? "active" : ""}`}
                >
                  🪄 Remove BG
                </button>
                <button
                  type="button"
                  onClick={resetImageEdit}
                  disabled={!originalImage || transformLoading}
                  className="editor-btn ghost"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setCompareMode((prev) => !prev)}
                  disabled={!editedImage || !originalImage}
                  className="editor-btn ghost"
                >
                  {compareMode ? "Single View" : "Compare"}
                </button>
              </div>

              <div className="filter-panel">
                {FILTERS.map((filter) => (
                  <button
                    type="button"
                    key={filter.key}
                    onClick={() => {
                      const next = selectedFilter === filter.key ? "" : filter.key;
                      setSelectedFilter(next);
                      applyPipeline({ selectedFilter: next });
                    }}
                    disabled={!image || transformLoading}
                    className={`filter-chip ${selectedFilter === filter.key ? "active" : ""}`}
                  >
                    🎨 {filter.label}
                  </button>
                ))}
              </div>

              {transformLoading && (
                <div className="ai-loading-state">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Applying AI image transformation...</span>
                </div>
              )}

              <div className="caption-voice-section">
                <p className="caption-voice-label">Caption</p>
                <div className="voice-input-toolbar">
                  {captionSpeech.isSupported && (
                    <select
                      className="voice-lang-select"
                      value={captionSpeech.lang}
                      onChange={(e) => captionSpeech.setLang(e.target.value)}
                      disabled={captionSpeech.isListening}
                      aria-label="Speech language"
                    >
                      {SPEECH_LANG_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="voice-input-row">
                    {captionSpeech.isSupported && (
                      <>
                        <button
                          type="button"
                          className={`voice-mic-btn ${captionSpeech.isListening ? "listening" : ""}`}
                          onClick={captionSpeech.toggle}
                          disabled={loading || aiLoading}
                          title={captionSpeech.isListening ? "Stop voice input" : "Start voice input"}
                          aria-label="Voice caption"
                        >
                          <Mic size={20} />
                        </button>
                        <button
                          type="button"
                          className="voice-stop-btn"
                          onClick={captionSpeech.stop}
                          disabled={!captionSpeech.isListening}
                          title="Stop"
                          aria-label="Stop recording"
                        >
                          <Square size={14} fill="currentColor" />
                        </button>
                        <button
                          type="button"
                          className="voice-clear-btn"
                          onClick={() => {
                            captionSpeech.stop();
                            setCaption("");
                          }}
                          disabled={!caption}
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                  {captionSpeech.isListening && (
                    <p className="voice-listening-hint">
                      <span className="voice-pulse-dot" />
                      Listening… speak your caption
                    </p>
                  )}
                  {!captionSpeech.isSupported && (
                    <p className="voice-unsupported-msg">
                      Voice input is not supported in this browser. Try Chrome or Edge.
                    </p>
                  )}
                  {captionSpeech.lastError && (
                    <p className="voice-error-msg">{captionSpeech.lastError}</p>
                  )}
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  required
                  disabled={loading || aiLoading}
                  className="caption-textarea"
                />
              </div>

              {image && !aiLoading && !captions && (
                <button 
                  type="button" 
                  onClick={handleAIButtonClick}
                  className="ai-generate-btn"
                >
                  <Sparkles size={16} className="mr-2" />
                  Generate AI Caption
                </button>
              )}

              {aiLoading && (
                <div className="ai-loading-state">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Analyzing image and generating captions...</span>
                </div>
              )}

              {captions && (
                <div className="ai-suggestions">
                  <p className="ai-label">AI Suggetions:</p>
                  <div className="caption-options">
                    <button 
                      type="button" 
                      onClick={() => selectCaption(captions.funny)}
                      className="caption-chip funny"
                    >
                      <span className="chip-label">Funny:</span> {captions.funny}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => selectCaption(captions.professional)}
                      className="caption-chip professional"
                    >
                      <span className="chip-label">Pro:</span> {captions.professional}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => selectCaption(captions.aesthetic)}
                      className="caption-chip aesthetic"
                    >
                      <span className="chip-label">Aesthetic:</span> {captions.aesthetic}
                    </button>
                  </div>
                  
                  <div className="hashtag-options">
                    {hashtags.map((tag) => (
                      <button 
                        key={tag} 
                        type="button" 
                        onClick={() => appendHashtag(tag)}
                        className="hashtag-chip"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="submit" 
              className="btn-primary share-btn" 
              disabled={loading || aiLoading || !canPost}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
