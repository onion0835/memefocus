window.memeMaker = function () {
  return {
    canvas: null,
    ctx: null,
    image: null,
    topText: "CLAUDE SAID IT WAS A SMALL FIX",
    bottomText: "NOW THE TEST SUITE HAS LORE",
    template: "claude",
    format: "square",
    fontSize: 72,
    textColor: "#ffffff",
    outlineColor: "#000000",
    uppercase: true,
    watermark: true,
    status: "",
    pageUrl: "https://memefocus.com/tools/meme-maker/",
    formats: {
      square: [1080, 1080],
      portrait: [1080, 1350],
      landscape: [1600, 900],
    },
    templates: {
      claude: ["#15162b", "#7c3aed", "#23c55e"],
      vibe: ["#0b1020", "#06b6d4", "#f59e0b"],
      deploy: ["#14151f", "#ef4444", "#a78bfa"],
      terminal: ["#050816", "#22c55e", "#38bdf8"],
    },

    init(canvas) {
      this.canvas = canvas || document.querySelector("[data-meme-canvas]");
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext("2d");
      this.render();
    },

    setTemplate(value) {
      this.template = value;
      this.image = null;
      this.render();
    },

    loadUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          this.image = img;
          this.render();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    },

    render() {
      if (!this.canvas || !this.ctx) return;
      const [width, height] = this.formats[this.format];
      this.canvas.width = width;
      this.canvas.height = height;
      this.drawBackground(width, height);
      this.drawCaption(this.topText, width, height, "top");
      this.drawCaption(this.bottomText, width, height, "bottom");
      if (this.watermark) this.drawWatermark(width, height);
    },

    drawBackground(width, height) {
      const ctx = this.ctx;
      const colors = this.templates[this.template];
      if (this.image) {
        this.drawCoverImage(this.image, width, height);
        const overlay = ctx.createLinearGradient(0, 0, width, height);
        overlay.addColorStop(0, "rgba(0,0,0,0.38)");
        overlay.addColorStop(0.5, "rgba(0,0,0,0.08)");
        overlay.addColorStop(1, "rgba(0,0,0,0.48)");
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, width, height);
        return;
      }

      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, colors[0]);
      bg.addColorStop(0.58, "#0b0f19");
      bg.addColorStop(1, colors[1]);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      this.drawPanel(width * 0.09, height * 0.2, width * 0.46, height * 0.22, colors[1]);
      this.drawPanel(width * 0.47, height * 0.42, width * 0.42, height * 0.26, colors[2]);
      this.drawToken(width * 0.78, height * 0.22, Math.min(width, height) * 0.095, colors[2], "</>");
      this.drawToken(width * 0.22, height * 0.68, Math.min(width, height) * 0.08, colors[1], "AI");
    },

    drawCoverImage(img, width, height) {
      const ctx = this.ctx;
      const scale = Math.max(width / img.width, height / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    },

    drawPanel(x, y, width, height, accent) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      this.roundRect(x, y, width, height, 28);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = accent;
      for (let i = 0; i < 5; i += 1) {
        ctx.fillRect(x + 34, y + 42 + i * 34, width * (0.28 + i * 0.08), 12);
      }
      ctx.restore();
    },

    drawToken(x, y, radius, color, label) {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `900 ${Math.max(24, radius * 0.52)}px Arial Black, Impact, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y + 2);
      ctx.restore();
    },

    drawCaption(value, width, height, position) {
      const raw = (value || "").trim();
      if (!raw) return;
      const text = this.uppercase ? raw.toUpperCase() : raw;
      const ctx = this.ctx;
      const maxWidth = width * 0.88;
      const size = Math.max(34, Math.min(this.fontSize, width / 11));
      const lines = this.wrapLines(text, maxWidth, size);
      const lineHeight = size * 1.08;
      const totalHeight = lines.length * lineHeight;
      const y = position === "top" ? height * 0.08 : height - height * 0.08 - totalHeight;

      ctx.save();
      ctx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeStyle = this.outlineColor;
      ctx.fillStyle = this.textColor;
      ctx.lineWidth = Math.max(8, size * 0.14);

      lines.forEach((line, index) => {
        const lineY = y + index * lineHeight;
        ctx.strokeText(line, width / 2, lineY, maxWidth);
        ctx.fillText(line, width / 2, lineY, maxWidth);
      });
      ctx.restore();
    },

    wrapLines(text, maxWidth, size) {
      const ctx = this.ctx;
      ctx.font = `900 ${size}px Impact, Arial Black, sans-serif`;
      const lines = [];
      text.split(/\n+/).forEach((block) => {
        const words = block.split(/\s+/).filter(Boolean);
        let line = "";
        words.forEach((word) => {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        });
        if (line) lines.push(line);
      });
      return lines.slice(0, 5);
    },

    drawWatermark(width, height) {
      const ctx = this.ctx;
      const text = "memefocus.com";
      ctx.save();
      ctx.font = `800 ${Math.max(22, width * 0.026)}px Arial, sans-serif`;
      const metrics = ctx.measureText(text);
      const pad = 18;
      const boxWidth = metrics.width + pad * 2;
      const boxHeight = 44;
      const x = width - boxWidth - 24;
      const y = height - boxHeight - 22;
      ctx.fillStyle = "rgba(0,0,0,0.56)";
      this.roundRect(x, y, boxWidth, boxHeight, 12);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + pad, y + boxHeight / 2 + 1);
      ctx.restore();
    },

    roundRect(x, y, width, height, radius) {
      const ctx = this.ctx;
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    },

    async canvasBlob() {
      this.render();
      return new Promise((resolve) => this.canvas.toBlob(resolve, "image/png", 0.95));
    },

    async downloadPng() {
      const blob = await this.canvasBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "memefocus-meme.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      this.status = "PNG ready.";
    },

    async shareImage() {
      const blob = await this.canvasBlob();
      const file = new File([blob], "memefocus-meme.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "MemeFocus meme",
          text: this.shareText(),
        });
        this.status = "Shared.";
      } else {
        await this.downloadPng();
        this.status = "PNG downloaded.";
      }
    },

    shareToX() {
      const url = new URL("https://twitter.com/intent/tweet");
      url.searchParams.set("text", this.shareText());
      url.searchParams.set("url", this.pageUrl);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    },

    shareToReddit() {
      const url = new URL("https://www.reddit.com/submit");
      url.searchParams.set("url", this.pageUrl);
      url.searchParams.set("title", this.shareText());
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    },

    shareText() {
      const joined = [this.topText, this.bottomText].map((part) => (part || "").trim()).filter(Boolean).join(" / ");
      return joined || "Made with MemeFocus";
    },
  };
};
