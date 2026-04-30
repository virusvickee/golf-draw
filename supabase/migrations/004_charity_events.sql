-- Add upcoming events column to charities table
ALTER TABLE charities 
ADD COLUMN IF NOT EXISTS 
events jsonb DEFAULT '[]';

-- Add sample events to existing featured charities for testing
UPDATE charities 
SET events = '[
  {
    "name": "Charity Golf Day",
    "date": "2026-06-15",
    "location": "St Andrews Golf Club",
    "description": "Our annual flagship charity golf tournament. Join us for 18 holes of championship golf followed by a gala dinner.",
    "link": "https://example.com/events/golf-day"
  },
  {
    "name": "Summer Community Fundraiser",
    "date": "2026-07-20", 
    "location": "Hyde Park, London",
    "description": "A family-friendly day in the sun with live music, food stalls, and interactive games to support our cause.",
    "link": "https://example.com/events/summer-fundraiser"
  }
]'::jsonb
WHERE is_featured = true;
