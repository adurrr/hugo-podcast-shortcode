package hugo_test

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// testDir returns the absolute path to the tests/hugo directory.
func testDir(t *testing.T) string {
	t.Helper()
	// Find the module root by walking up from this file's directory
	// until we find go.mod
	dir, err := os.Getwd()
	if err != nil {
		t.Fatalf("failed to get working directory: %v", err)
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			t.Fatalf("could not find module root from %s", dir)
		}
		dir = parent
	}
}

// buildHugoSite builds a Hugo site from testdata/<name> and returns
// the output directory path. It uses the host Hugo binary.
func buildHugoSite(t *testing.T, name string, envVars ...string) string {
	t.Helper()
	root := testDir(t)
	siteDir := filepath.Join(root, "tests", "hugo", "testdata", name)
	outputDir := filepath.Join(siteDir, "public")

	// Clean previous output
	os.RemoveAll(outputDir)

	cmd := exec.Command("hugo", "--source", siteDir, "--destination", outputDir)
	cmd.Env = append(os.Environ(), envVars...)
	cmd.Dir = siteDir

	output, err := cmd.CombinedOutput()
	if err != nil {
		// Capture stderr separately when build fails, since Hugo routes
		// error messages there.  CombinedOutput already merges both,
		// but we keep the explicit separation for clarity.
		t.Fatalf("hugo build failed for %s (exit: %v):\n%s", name, err, string(output))
	}

	return outputDir
}

// readOutputFile returns the content of a file relative to the output directory.
func readOutputFile(t *testing.T, outputDir, relPath string) string {
	t.Helper()
	path := filepath.Join(outputDir, relPath)
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("failed to read output file %s: %v", path, err)
	}
	return string(data)
}

// assertFileContent checks that the output file contains the expected substring.
func assertFileContent(t *testing.T, outputDir, relPath, expected string) {
	t.Helper()
	content := readOutputFile(t, outputDir, relPath)
	if !strings.Contains(content, expected) {
		t.Errorf("expected output to contain %q\n%s", expected, content)
	}
}

// assertFileContentOnce checks that the expected substring appears exactly once.
func assertFileContentOnce(t *testing.T, outputDir, relPath, expected string) {
	t.Helper()
	content := readOutputFile(t, outputDir, relPath)
	count := strings.Count(content, expected)
	if count != 1 {
		t.Errorf("expected %q to appear once, got %d times\n%s", expected, count, content)
	}
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

func TestPodcastPlayerShortcode_RendersRequiredSrc(t *testing.T) {
	outputDir := buildHugoSite(t, "required-src")
	assertFileContent(t, outputDir, "posts/test-episode/index.html",
		`<podcast-player`)
	assertFileContent(t, outputDir, "posts/test-episode/index.html",
		`src="https://example.com/audio.mp3"`)
}

func TestPodcastPlayerShortcode_MissingSrcErrors(t *testing.T) {
	root := testDir(t)
	siteDir := filepath.Join(root, "tests", "hugo", "testdata", "missing-src")

	cmd := exec.Command("hugo", "--source", siteDir)
	cmd.Dir = siteDir

	output, err := cmd.CombinedOutput()

	// Should fail because src is required
	if err == nil {
		t.Fatal("expected build error for missing src, but build succeeded")
	}

	if !strings.Contains(string(output), "error") &&
		!strings.Contains(string(output), "Error") {
		t.Fatalf("expected error message in output, got:\n%s", string(output))
	}
}

func TestPodcastPlayerShortcode_WithTitle(t *testing.T) {
	outputDir := buildHugoSite(t, "with-title")
	assertFileContent(t, outputDir, "posts/test-episode/index.html",
		`title="Episode 42: Hello World"`)
}

func TestPodcastPlayerShortcode_WithPoster(t *testing.T) {
	outputDir := buildHugoSite(t, "with-poster")
	assertFileContent(t, outputDir, "posts/test-episode/index.html",
		`poster="https://example.com/cover.jpg"`)
}

func TestPodcastPlayerShortcode_WithChapters(t *testing.T) {
	outputDir := buildHugoSite(t, "with-chapters")
	assertFileContent(t, outputDir, "posts/test-episode/index.html",
		`chapters="00:00:00-Intro,00:05:30-News"`)
}

func TestPodcastPlayerShortcode_WithDescription(t *testing.T) {
	outputDir := buildHugoSite(t, "with-description")
	assertFileContent(t, outputDir, "posts/test-episode/index.html", `slot="description"`)
	assertFileContent(t, outputDir, "posts/test-episode/index.html", `<strong>bold</strong>`)
}

func TestPodcastPlayerShortcode_AssetsLoadedOnce(t *testing.T) {
	outputDir := buildHugoSite(t, "assets-loaded-once")
	// The JS module script tag should appear exactly once (handled by .Page.Store guard)
	assertFileContentOnce(t, outputDir, "posts/test-episode/index.html",
		`type="module"`)
}

func TestPodcastPlayerShortcode_PersistentFlag(t *testing.T) {
	outputDir := buildHugoSite(t, "persistent-flag")
	assertFileContent(t, outputDir, "posts/test-episode/index.html", `persistent`)
}

func TestPodcastPlayerShortcode_DefaultNoPersistent(t *testing.T) {
	outputDir := buildHugoSite(t, "no-persistent")
	content := readOutputFile(t, outputDir, "posts/test-episode/index.html")
	if strings.Contains(content, "persistent") {
		t.Errorf("expected no 'persistent' attribute when persistent=false")
	}
}

func TestPodcastPlayerShortcode_WithUrl(t *testing.T) {
	outputDir := buildHugoSite(t, "with-url")
	assertFileContent(t, outputDir, "posts/test-episode/index.html",
		`url="https://example.com/page"`)
}

func TestPodcastPlayerShortcode_UrlNone(t *testing.T) {
	outputDir := buildHugoSite(t, "url-none")
	assertFileContent(t, outputDir, "posts/test-episode/index.html",
		`url="none"`)
}

func TestPodcastPlayerShortcode_UrlOmitted(t *testing.T) {
	// Reuse an existing testdata site that does not pass `url`. The rendered
	// HTML must NOT contain a `url="…"` attribute at all (the shortcode
	// omits the attribute when empty).
	outputDir := buildHugoSite(t, "required-src")
	content := readOutputFile(t, outputDir, "posts/test-episode/index.html")
	if strings.Contains(content, ` url="`) {
		t.Errorf("expected no url attribute when omitted, got:\n%s", content)
	}
}

func TestPodcastPlayerShortcode_BadUrlScheme(t *testing.T) {
	root := testDir(t)
	siteDir := filepath.Join(root, "tests", "hugo", "testdata", "bad-url-scheme")

	cmd := exec.Command("hugo", "--source", siteDir)
	cmd.Dir = siteDir

	output, err := cmd.CombinedOutput()

	// Build MUST fail because `url="javascript:alert(1)"` is rejected by
	// the shortcode's allow-list (http/https/relative/fragment/dot-relative/none).
	if err == nil {
		t.Fatalf("expected build error for javascript: url, but build succeeded:\n%s", string(output))
	}

	// The error must mention the bad scheme so the user can debug the
	// shortcode invocation. Accept any case-variant of "javascript:" or
	// "scheme" — Hugo's error wrapping can vary by version.
	combined := string(output)
	if !strings.Contains(combined, "javascript:") && !strings.Contains(combined, "scheme") {
		t.Errorf("expected error to mention the bad scheme, got:\n%s", combined)
	}
}

func TestPodcastPlayerShortcode_WithLiveMode(t *testing.T) {
	outputDir := buildHugoSite(t, "with-live-mode")
	content := readOutputFile(t, outputDir, "posts/test-episode/index.html")
	if !strings.Contains(content, `data-azuracast-api-url="https://example.com/api/live/nowplaying/test"`) {
		t.Errorf("expected data-azuracast-api-url attribute in output, got:\n%s", content)
	}
	if !strings.Contains(content, " live-mode") {
		t.Errorf("expected live-mode boolean attribute in output, got:\n%s", content)
	}
	if strings.Contains(content, `live-mode="`) {
		t.Errorf("live-mode should be a boolean attribute (no value), got:\n%s", content)
	}
}

func TestPodcastPlayerShortcode_LiveModeOmitted(t *testing.T) {
	// Reuses the with-url testdata which has no live-mode or api-url params.
	outputDir := buildHugoSite(t, "with-url")
	content := readOutputFile(t, outputDir, "posts/test-episode/index.html")
	if strings.Contains(content, "data-azuracast-api-url") {
		t.Errorf("expected no data-azuracast-api-url when omitted, got:\n%s", content)
	}
	if strings.Contains(content, " live-mode") {
		t.Errorf("expected no live-mode when omitted, got:\n%s", content)
	}
}

func TestPodcastPlayerShortcode_BadAzuracastApiUrl(t *testing.T) {
	root := testDir(t)
	siteDir := filepath.Join(root, "tests", "hugo", "testdata", "bad-azuracast-api-url")
	cmd := exec.Command("hugo", "--source", siteDir)
	cmd.Dir = siteDir
	output, err := cmd.CombinedOutput()
	if err == nil {
		t.Fatalf("expected build error for http:// api URL, but build succeeded:\n%s", output)
	}
	combined := strings.ToLower(string(output))
	if !strings.Contains(combined, "https") {
		t.Errorf("expected error to mention the https scheme, got:\n%s", output)
	}
}
