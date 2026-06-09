package hugo_test

import (
	"testing"
)

// TestI18nInjectedEnglish verifies that English i18n strings are injected
// into the page when the site is built with multilingual config.
func TestI18nInjectedEnglish(t *testing.T) {
	outputDir := buildHugoSite(t, "i18n-injected")

	// English content (at root, since defaultContentLanguageInSubdir defaults to false)
	content := readOutputFile(t, outputDir, "index.html")
	assertContains(t, content, `window.wavecast.i18n`)
	assertContains(t, content, `Play`)
}

// TestI18nInjectedSpanish verifies that Spanish i18n strings are injected
// when building the Spanish version of the site.
func TestI18nInjectedSpanish(t *testing.T) {
	outputDir := buildHugoSite(t, "i18n-injected")

	// Spanish content should have Spanish i18n strings
	content := readOutputFile(t, outputDir, "es/index.html")
	assertContains(t, content, `window.wavecast.i18n`)
	assertContains(t, content, `Reproducir`)
}

// TestI18nTemplatesCarousel verifies that the carousel template uses
// translated strings via the i18n/T function.
func TestI18nTemplatesCarousel(t *testing.T) {
	outputDir := buildHugoSite(t, "i18n-templates")
	content := readOutputFile(t, outputDir, "index.html")

	// Carousel should have translated aria labels
	assertContains(t, content, `aria-label="Image carousel"`)
	assertContains(t, content, `aria-label="Previous slide"`)
	assertContains(t, content, `aria-label="Next slide"`)
}

// TestI18nTemplatesVideo verifies that the video template uses
// translated fallback text.
func TestI18nTemplatesVideo(t *testing.T) {
	outputDir := buildHugoSite(t, "i18n-templates")
	content := readOutputFile(t, outputDir, "index.html")

	assertContains(t, content, `Your browser does not support the video tag.`)
}

// TestI18nBackwardCompat verifies that a site without i18n config
// builds successfully (i18n function returns empty string gracefully).
func TestI18nBackwardCompat(t *testing.T) {
	outputDir := buildHugoSite(t, "i18n-backward-compat")
	content := readOutputFile(t, outputDir, "index.html")

	// Should still build and inject the i18n object (with empty values)
	assertContains(t, content, `window.wavecast.i18n`)
}
