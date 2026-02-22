import { get24HoursAgo, parseDate } from "./date";

describe("get24HoursAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns timestamp 24 hours before now", () => {
    const fixed = new Date("2024-06-15T12:00:00.000Z").getTime();
    vi.setSystemTime(fixed);

    const result = get24HoursAgo();

    const expected = new Date("2024-06-14T12:00:00.000Z").getTime();
    expect(result).toBe(expected);
  });

  it("returns a number (ms)", () => {
    vi.setSystemTime(1700000000000);

    const result = get24HoursAgo();

    expect(typeof result).toBe("number");
    expect(result).toBe(1700000000000 - 24 * 60 * 60 * 1000);
  });
});

describe("parseDate", () => {
  it("returns null for undefined", () => {
    expect(parseDate(undefined)).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(parseDate("")).toBe(null);
  });

  it("returns null for invalid date string", () => {
    expect(parseDate("invalid")).toBe(null);
    expect(parseDate("not-a-date")).toBe(null);
  });

  it("returns timestamp for valid ISO date string", () => {
    const result = parseDate("2024-01-15T00:00:00.000Z");
    expect(result).toBe(1705276800000);
  });
});
