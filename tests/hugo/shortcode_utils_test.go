package hugo_test

import (
	"strings"
	"testing"
)

func TestAdmonitionNote_WithTitle(t *testing.T) {
	outputDir := buildHugoSite(t, "admonition-note")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-admonition--note")
	assertContains(t, content, "wvc-admonition__title")
	assertContains(t, content, "Heads Up")
	assertContains(t, content, "<strong>note</strong>")
}

func TestAdmonitionDanger_NoTitle(t *testing.T) {
	outputDir := buildHugoSite(t, "admonition-danger")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-admonition--danger")
	assertContains(t, content, "<strong>Critical:</strong>")
	if strings.Contains(content, "wvc-admonition__title") {
		t.Error("should not have title when not set")
	}
}

func TestAdmonitionTip_NoTitle(t *testing.T) {
	outputDir := buildHugoSite(t, "admonition-tip")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-admonition--tip")
	// Should render markdown inline code
	assertContains(t, content, "<code>hugo serve</code>")
}

func TestAdmonitionWarning_WithTitle(t *testing.T) {
	outputDir := buildHugoSite(t, "admonition-warning")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-admonition--warning")
	assertContains(t, content, "Deprecation Notice")
}

func TestButtonPrimary_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "button-primary")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-button--primary")
	assertContains(t, content, "Learn More")
	assertContains(t, content, `href="/about"`)
}

func TestButtonExternal_OpensNewTab(t *testing.T) {
	outputDir := buildHugoSite(t, "button-external")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-button--secondary")
	assertContains(t, content, `href="https://example.com/"`)
	assertContains(t, content, `target="_blank"`)
	assertContains(t, content, `rel="noopener noreferrer"`)
}

func TestButtonIcon_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "button-icon")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-button__icon")
	assertContains(t, content, "Get Started")
}

func TestFigureCaption_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "figure-caption")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-figure")
	assertContains(t, content, "wvc-figure__caption")
	assertContains(t, content, "<strong>beautiful</strong>")
	assertContains(t, content, `alt="Sunset over mountains"`)
	assertContains(t, content, `loading="lazy"`)
}

func TestFigureExternal_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "figure-external")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-figure")
	assertContains(t, content, `src="https://example.com/photo.jpg"`)
	assertContains(t, content, `loading="lazy"`)
}

func TestVideoBasic_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "video-basic")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-video")
	assertContains(t, content, "controls")
	assertContains(t, content, `<source src="https://example.com/demo.mp4"`)
}

func TestVideoPoster_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "video-poster")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, `poster="https://example.com/thumb.jpg"`)
}

func TestVideoCaption_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "video-caption")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-video__caption")
	assertContains(t, content, "<strong>demo</strong>")
}

func TestTabsBasic_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "tabs-basic")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-tabs")
	assertContains(t, content, "wvc-tabs__labels")
	assertContains(t, content, `role="tabpanel"`)
	assertContains(t, content, "First Tab")
	assertContains(t, content, "Second Tab")
	assertContains(t, content, "Content of first tab")
	assertContains(t, content, "Content of second tab")
	assertContains(t, content, `aria-label="First Tab"`)
	assertContains(t, content, `aria-label="Second Tab"`)
}

func TestTabsThree_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "tabs-three")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "Tab A")
	assertContains(t, content, "Tab B")
	assertContains(t, content, "Tab C")
	assertContains(t, content, "Content A")
	assertContains(t, content, "Content B")
	assertContains(t, content, "Content C")
}

func TestTabsSelected_FirstTabActive(t *testing.T) {
	outputDir := buildHugoSite(t, "tabs-selected")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "Visible content")
	assertContains(t, content, "Hidden content")
	assertContains(t, content, "checked")
	assertContains(t, content, `aria-labelledby="wvc-tablabel-wvc-tabs-0-0"`)
}

func TestCarouselBasic_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "carousel-basic")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-carousel")
	assertContains(t, content, `role="region"`)
	assertContains(t, content, "wvc-carousel__slides")
	assertContains(t, content, "wvc-carousel__prev")
	assertContains(t, content, "wvc-carousel__next")
	assertContains(t, content, `aria-label="Previous slide"`)
	assertContains(t, content, `aria-label="Next slide"`)
}

func TestGalleryBasic_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "gallery-basic")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-gallery")
	assertContains(t, content, `src="https://example.com/thumb1.jpg"`)
	assertContains(t, content, `src="https://example.com/thumb2.jpg"`)
}

func TestGalleryLightbox_Renders(t *testing.T) {
	outputDir := buildHugoSite(t, "gallery-lightbox")
	content := readOutputFile(t, outputDir, "posts/test-page/index.html")
	assertContains(t, content, "wvc-gallery")
	assertContains(t, content, `href="https://example.com/full.jpg"`)
}

// ── Helpers (shared with shortcode_test.go via same package) ──
func assertContains(t *testing.T, content, expected string) {
	t.Helper()
	if !strings.Contains(content, expected) {
		t.Errorf("expected output to contain %q\n%s", expected, content)
	}
}
