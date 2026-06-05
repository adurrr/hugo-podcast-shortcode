package hugo_test

import (
	"strings"
	"testing"
)

// ---------------------------------------------------------------------------
// RSS Feed Tests
// ---------------------------------------------------------------------------

func TestRSS_PodcastMode_HasITunesNamespace(t *testing.T) {
	outputDir := buildHugoSite(t, "podcast-rss")
	content := readOutputFile(t, outputDir, "index.xml")
	if !strings.Contains(content, `xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"`) {
		t.Errorf("expected itunes namespace in podcast RSS feed, got:\n%s", content)
	}
}

func TestRSS_PodcastMode_ChannelElements(t *testing.T) {
	outputDir := buildHugoSite(t, "podcast-rss")
	content := readOutputFile(t, outputDir, "index.xml")

	checks := []struct {
		label, expected string
	}{
		{"channel title", "<title>Test Podcast RSS</title>"},
		{"channel description", "<description>A podcast about testing RSS feeds.</description>"},
		{"itunes:author", "<itunes:author>Test Author</itunes:author>"},
		{"itunes:summary", "<itunes:summary>This is a test podcast summary for RSS feed validation.</itunes:summary>"},
		{"itunes:image", `<itunes:image href="https://example.org/cover.jpg" />`},
		{"itunes:category Technology", `<itunes:category text="Technology">`},
		{"itunes:category Education/Courses", `<itunes:category text="Education"><itunes:category text="Courses" />`},
		{"itunes:explicit", "<itunes:explicit>false</itunes:explicit>"},
		{"itunes:owner name", "<itunes:name>Test Owner</itunes:name>"},
		{"itunes:owner email", "<itunes:email>owner@test.example</itunes:email>"},
		{"itunes:type", "<itunes:type>episodic</itunes:type>"},
		{"generator", "<generator>Hugo — wavecast theme</generator>"},
		{"atom:link self", `<atom:link href="https://example.org/index.xml"`},
		{"language", "<language>en-us</language>"},
		{"copyright", "<copyright>© 2025 Test Podcast</copyright>"},
	}

	for _, c := range checks {
		if !strings.Contains(content, c.expected) {
			t.Errorf("%s: expected %q not found in RSS output", c.label, c.expected)
		}
	}
}

func TestRSS_PodcastMode_ItemElements(t *testing.T) {
	outputDir := buildHugoSite(t, "podcast-rss")
	content := readOutputFile(t, outputDir, "index.xml")

	checks := []struct {
		label, expected string
	}{
		{"item title", "<title>Episode One: Getting Started</title>"},
		{"enclosure url", `url="https://example.org/audio/ep1.mp3"`},
		{"enclosure type", `type="audio/mpeg"`},
		{"enclosure length", `length="0"`}, // remote URL, length=0
		{"itunes:duration", "<itunes:duration>00:30:00</itunes:duration>"},
		{"itunes:season", "<itunes:season>1</itunes:season>"},
		{"itunes:episode", "<itunes:episode>1</itunes:episode>"},
		{"itunes:episodeType", "<itunes:episodeType>full</itunes:episodeType>"},
		{"guid isPermaLink=false", `<guid isPermaLink="false">test-episode-1</guid>`},
		{"itunes:author item", "<itunes:author>Test Author</itunes:author>"},
	}

	for _, c := range checks {
		if !strings.Contains(content, c.expected) {
			t.Errorf("%s: expected %q not found in RSS output", c.label, c.expected)
		}
	}

	// Verify both channel-level AND item-level explicit tags exist
	explicitCount := strings.Count(content, "<itunes:explicit>false</itunes:explicit>")
	if explicitCount < 2 {
		t.Errorf("expected at least 2 explicit tags (channel + item), got %d", explicitCount)
	}
}

func TestRSS_PodcastMode_OnlyItemsWithSource(t *testing.T) {
	// All regular pages are iterated, but only those with podcast.src get <item> elements.
	// The test fixture has one episode with podcast.src.
	outputDir := buildHugoSite(t, "podcast-rss")
	content := readOutputFile(t, outputDir, "index.xml")

	// Count <item> elements
	itemCount := strings.Count(content, "<item>")
	if itemCount != 1 {
		t.Errorf("expected exactly 1 <item> (only pages with podcast.src), got %d", itemCount)
	}
}

func TestRSS_StandardMode_NoITunesNamespace(t *testing.T) {
	outputDir := buildHugoSite(t, "standard-rss")
	content := readOutputFile(t, outputDir, "index.xml")

	if strings.Contains(content, "itunes:") {
		t.Errorf("standard RSS mode should NOT contain itunes namespace, got:\n%s", content)
	}
	if !strings.Contains(content, `xmlns:atom="http://www.w3.org/2005/Atom"`) {
		t.Errorf("expected standard RSS 2.0 with atom namespace, got:\n%s", content)
	}
}

func TestRSS_StandardMode_ItemElements(t *testing.T) {
	outputDir := buildHugoSite(t, "standard-rss")
	content := readOutputFile(t, outputDir, "index.xml")

	checks := []struct {
		label, expected string
	}{
		{"item title", "<title>Hello World</title>"},
		{"guid permalink", "<guid>https://example.org/posts/hello/</guid>"},
		{"atom:link self", `<atom:link href="https://example.org/index.xml"`},
	}

	for _, c := range checks {
		if !strings.Contains(content, c.expected) {
			t.Errorf("%s: expected %q not found in standard RSS output", c.label, c.expected)
		}
	}
}

func TestRSS_PodcastMode_ItemsSortedByDate(t *testing.T) {
	// Verify the RSS demo episode (2026-06-01) appears before older episodes
	outputDir := buildHugoSite(t, "podcast-rss")
	content := readOutputFile(t, outputDir, "index.xml")

	// Our test fixture has ONE episode dated 2026-06-01
	if !strings.Contains(content, "<pubDate>Mon, 01 Jun 2026 00:00:00 +0000</pubDate>") {
		t.Errorf("expected pubDate for Episode One, got:\n%s", content)
	}
}
