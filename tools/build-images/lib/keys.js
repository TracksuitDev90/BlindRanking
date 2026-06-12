// Stable manifest keys + work-unit construction.
//
// Key scheme (mirrored by slugKey()/manifestEntryFor() in script.js):
//   default:   slug of the full label, e.g. "pride-and-prejudice-2005-film"
//   conflict:  "<labelSlug>@@<topicSlug>" when the same label infers different
//              categories in different topics (rare).
import {
  normalize, categoryForBuild, topicWikiHints, wikiHintsForCategory
} from './categorize.js';

export const slug = s => normalize(s).replace(/ /g, '-');

// Entertainment-flavored topics prefer TMDB headshots over Wikipedia portraits.
function isEntertainmentTopic(topic) {
  const tn = normalize(topic.name || '');
  if (topic.mood === 'movies' || topic.mood === 'tv') return true;
  return /\bactor|\bactress|\bcomedian|\bdirector|\bcelebrit|\bmovie star|\btalk show|\bhost\b/.test(tn);
}

// A label appearing in several topics can infer different categories. Most
// such conflicts are equivalent treatments (an artist is person in one topic,
// music-artist in another) — merge those into one unit; only genuinely
// incompatible categories split into per-topic keys.
function mergeCategories(cats) {
  if (cats.size > 1) cats.delete('generic'); // generic yields to anything specific
  if (cats.size === 1) return [...cats][0];
  const set = new Set(cats);
  if (set.size === 2 && set.has('person') && set.has('music-artist')) return 'music-artist';
  if (set.size === 2 && set.has('person') && set.has('fashion')) return 'person';
  return null;
}

// Flattens every topic+item pair (items ∪ itemPool — the app re-rolls items
// from itemPool on every visit) into deduplicated work units.
export function buildUnits(topics) {
  const byLabel = new Map();
  for (const topic of topics) {
    const pool = [...(topic.items || []), ...(topic.itemPool || [])];
    const seenInTopic = new Set();
    for (const item of pool) {
      if (!item?.label || seenInTopic.has(item.label)) continue;
      seenInTopic.add(item.label);
      if (!byLabel.has(item.label)) byLabel.set(item.label, []);
      byLabel.get(item.label).push({ topic, item });
    }
  }

  const units = [];
  for (const [label, refs] of byLabel) {
    const variants = refs.map(({ topic, item }) => {
      const hints = {
        provider: topic.provider || '',
        mediaType: topic.mediaType || '',
        topicName: topic.name || '',
        ...(item.hints || {})
      };
      return {
        topic,
        item,
        category: categoryForBuild(label, hints, topic.mood || '')
      };
    });

    const merged = mergeCategories(new Set(variants.map(v => v.category)));
    const groups = merged
      ? [{ key: slug(label), variants, category: merged }]
      : variants.map(v => ({ key: `${slug(label)}@@${slug(v.topic.name)}`, variants: [v], category: v.category }));

    for (const g of groups) {
      const category = g.category;
      const topicNames = g.variants.map(v => v.topic.name);
      const hintWords = [
        ...(wikiHintsForCategory(category) || []),
        ...g.variants.flatMap(v => topicWikiHints(v.topic.name))
      ];
      units.push({
        key: g.key,
        label,
        category,
        topics: topicNames,
        moods: [...new Set(g.variants.map(v => v.topic.mood || ''))],
        hintWords: [...new Set(hintWords.map(h => h.toLowerCase()))],
        entertainment: g.variants.some(v => isEntertainmentTopic(v.topic)),
        imageUrlOverride: g.variants.find(v => v.item.imageUrl)?.item.imageUrl || null
      });
    }
  }
  return units.sort((a, b) => a.key.localeCompare(b.key));
}
