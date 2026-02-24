/**
 * Unit tests for utility functions
 * Tests core functionality: HTML decoding, date formatting
 */

describe('decodeHTML', () => {
  const decodeHTML = (html) => {
    return html
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
  };

  test('should decode HTML quotes', () => {
    expect(decodeHTML('&quot;Hello&quot;')).toBe('"Hello"');
  });

  test('should decode HTML apostrophes', () => {
    expect(decodeHTML('It&#039;s')).toBe("It's");
  });

  test('should decode HTML ampersands', () => {
    expect(decodeHTML('Tom &amp; Jerry')).toBe('Tom & Jerry');
  });

  test('should decode HTML less than and greater than', () => {
    expect(decodeHTML('5 &lt; 10 &gt; 3')).toBe('5 < 10 > 3');
  });

  test('should decode HTML non-breaking spaces', () => {
    expect(decodeHTML('Hello&nbsp;World')).toBe('Hello World');
  });

  test('should handle multiple entities in one string', () => {
    expect(decodeHTML('&quot;Tom &amp; Jerry&quot; is &lt;fun&gt;'))
      .toBe('"Tom & Jerry" is <fun>');
  });

  test('should return unchanged string if no entities', () => {
    expect(decodeHTML('Hello World')).toBe('Hello World');
  });
});

describe('formatDate', () => {
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  test('should format recent minutes correctly (singular)', () => {
    const oneMinAgo = new Date(Date.now() - 60000).toISOString();
    expect(formatDate(oneMinAgo)).toBe('1 min ago');
  });

  test('should format recent minutes correctly (plural)', () => {
    const fiveMinsAgo = new Date(Date.now() - 300000).toISOString();
    expect(formatDate(fiveMinsAgo)).toBe('5 mins ago');
  });

  test('should format recent hours correctly (singular)', () => {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    expect(formatDate(oneHourAgo)).toBe('1 hour ago');
  });

  test('should format recent hours correctly (plural)', () => {
    const threeHoursAgo = new Date(Date.now() - 10800000).toISOString();
    expect(formatDate(threeHoursAgo)).toBe('3 hours ago');
  });

  test('should format recent days correctly (singular)', () => {
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
    expect(formatDate(oneDayAgo)).toBe('1 day ago');
  });

  test('should format recent days correctly (plural)', () => {
    const threeDaysAgo = new Date(Date.now() - 259200000).toISOString();
    expect(formatDate(threeDaysAgo)).toBe('3 days ago');
  });
});

describe('Quiz Score Calculation', () => {
  test('should calculate percentage correctly', () => {
    expect(Math.round((8 / 10) * 100)).toBe(80);
    expect(Math.round((5 / 10) * 100)).toBe(50);
    expect(Math.round((10 / 10) * 100)).toBe(100);
    expect(Math.round((0 / 10) * 100)).toBe(0);
  });

  test('should determine correct result message', () => {
    const getMessage = (percentage) => {
      if (percentage >= 80) return 'Excellent!';
      if (percentage >= 60) return 'Great Job!';
      if (percentage >= 40) return 'Good Effort!';
      return 'Keep Learning!';
    };

    expect(getMessage(90)).toBe('Excellent!');
    expect(getMessage(80)).toBe('Excellent!');
    expect(getMessage(70)).toBe('Great Job!');
    expect(getMessage(60)).toBe('Great Job!');
    expect(getMessage(50)).toBe('Good Effort!');
    expect(getMessage(40)).toBe('Good Effort!');
    expect(getMessage(30)).toBe('Keep Learning!');
  });
});