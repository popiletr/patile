# Büyüme ve ev eşyaları — görsel üretim kaydı

2026-10-23. Araç: built-in image_gen; CLI kullanılmadı. Tüm dosyalar `sprite_preview/patilife_v2/assets/` içinde. Genç/yetişkin sarman atlasları mevcut yavru bekleme/yürüme ve bakım atlaslarından; diğer desenler ilgili yaşın sarman atlası ve kendi yavru desenlerinden türetildi. Eşyalar başlangıç eşya atlasını referans alır.

Her yaş atlasında 4 sütun × 5 satır: bekleme, yürüme, yeme, içme, uyuma. Her satır dört kare. Yeni üretilen 8 atlas 160 kare; yavru atlaslarıyla toplam 240 karakter karesi. Üç yeni eşya atlasında 16+16+8 ürün; başlangıç sekiz ürünle katalog 48.

Görseller gözle incelendi. Alfa, kaynak sınırları ve silüet sayıları ayrıca denetlendi. Büyük nesneler nominal hücre sınırını aştığında bağımsız bağlı silüetlerin sınırları okunur; PNG'ler Python ile düzenlenmez. Son cihaz görsel denetimi henüz yapılmadı. Kalan özel eylemler (tırmalama/tırmanma gibi) için ayrı animasyonlar hâlâ gerekli; mevcut uygulama bunları kısa keşif/bekleme olarak gösterir.

## Genç sarman

Dosya: `sarman-young.png`

Tam prompt:

PatiLife production 2D cartoon animation sprite atlas. References show SAME orange/cream cat's baby identity and motions, use simple brown outlines, dot eyes, w mouth, flat pastel cream/orange shapes, NO realistic fur or 3D. Create this cat's ADOLESCENT young cat: slightly longer body and legs than kitten, head moderately smaller relative to body, still cute and rounded. Exactly FOUR COLUMNS by FIVE ROWS, TWENTY isolated full-cat frames on genuine transparent alpha. Equal square cells, consistent model/size/baseline throughout, 12% empty margins in each cell. Row1: four seated idle frames open eyes, half blink, closed blink, open eyes/tail sway. Row2: four side/three-quarter RIGHT-facing four-paw walk cycle frames, alternating leg positions, no bipedal walking. Row3: four right-facing lowered-head eating frames small chewing/head dips, no bowls. Row4: four right-facing drinking frames lowered head and tiny pink tongue in/out, no bowls. Row5: four curled-up sleeping frames closed eyes subtle breathing. Preserve orange head/back patches and striped tail, all cells same age/proportions, common floor baseline at 84% of each cell. No props no labels no cell dividers no lettering no emojis no scenery no floor shadows. Whole character in every frame, no tails/paws cropped. Do NOT just enlarge the baby: redraw the specified age anatomy. Output portrait 4:5 ratio ideal 1024x1280.

## Yetişkin sarman

Dosya: `sarman-adult.png`

Tam prompt:

PatiLife production 2D cartoon animation sprite atlas. References show SAME orange/cream cat's baby identity and motions, use simple brown outlines, dot eyes, w mouth, flat pastel cream/orange shapes, NO realistic fur or 3D. Create this cat's fully ADULT cat: noticeably longer sturdy oval torso, proportionately smaller round head, developed legs and long tail; clear adult silhouette distinct from baby, still simple cute cartoon. Exactly FOUR COLUMNS by FIVE ROWS, TWENTY isolated full-cat frames on genuine transparent alpha. Equal square cells, consistent model/size/baseline throughout, 12% empty margins in each cell. Row1: four seated idle frames open eyes, half blink, closed blink, open eyes/tail sway. Row2: four side/three-quarter RIGHT-facing four-paw walk cycle frames, alternating leg positions, no bipedal walking. Row3: four right-facing lowered-head eating frames small chewing/head dips, no bowls. Row4: four right-facing drinking frames lowered head and tiny pink tongue in/out, no bowls. Row5: four curled-up sleeping frames closed eyes subtle breathing. Preserve orange head/back patches and striped tail, all cells same age/proportions, common floor baseline at 84% of each cell. No props no labels no cell dividers no lettering no emojis no scenery no floor shadows. Whole character in every frame, no tails/paws cropped. Do NOT just enlarge the baby: redraw the specified age anatomy. Output portrait 4:5 ratio ideal 1024x1280.

## tekir young

Dosya: `tekir-young.png`

Tam prompt:

Edit reference 1 (the young age orange cat atlas) by recoloring ONLY the coat to brown and cream mackerel tabby with simple brown stripes, using reference 2 for coat identity. Preserve exact canvas size, all TWENTY poses in FOUR COLUMNS by FIVE ROWS, locations, age anatomy, outlines and common baseline. Rows: idle blink, right-facing walk, eat, drink, curled sleep, four frames each. Keep consistent markings across poses and same age as reference 1. Match the simple pastel 2D cartoon style with dot eyes/w mouth; no realistic fur or 3D. Genuine transparent alpha; no background no props no labels no text no borders no emoji. Do not alter poses or scale, do not add or omit frames.

## smokin young

Dosya: `smokin-young.png`

Tam prompt:

Edit reference 1 (the young age orange cat atlas) by recoloring ONLY the coat to charcoal and white tuxedo with white chest muzzle and paw tips, using reference 2 for coat identity. Preserve exact canvas size, all TWENTY poses in FOUR COLUMNS by FIVE ROWS, locations, age anatomy, outlines and common baseline. Rows: idle blink, right-facing walk, eat, drink, curled sleep, four frames each. Keep consistent markings across poses and same age as reference 1. Match the simple pastel 2D cartoon style with dot eyes/w mouth; no realistic fur or 3D. Genuine transparent alpha; no background no props no labels no text no borders no emoji. Do not alter poses or scale, do not add or omit frames.

## calico young

Dosya: `calico-young.png`

Tam prompt:

Edit reference 1 (the young age orange cat atlas) by recoloring ONLY the coat to white calico with simple orange and charcoal patches, using reference 2 for coat identity. Preserve exact canvas size, all TWENTY poses in FOUR COLUMNS by FIVE ROWS, locations, age anatomy, outlines and common baseline. Rows: idle blink, right-facing walk, eat, drink, curled sleep, four frames each. Keep consistent markings across poses and same age as reference 1. Match the simple pastel 2D cartoon style with dot eyes/w mouth; no realistic fur or 3D. Genuine transparent alpha; no background no props no labels no text no borders no emoji. Do not alter poses or scale, do not add or omit frames.

## tekir adult

Dosya: `tekir-adult.png`

Tam prompt:

Edit reference 1 (the adult age orange cat atlas) by recoloring ONLY the coat to brown and cream mackerel tabby with simple brown stripes, using reference 2 for coat identity. Preserve exact canvas size, all TWENTY poses in FOUR COLUMNS by FIVE ROWS, locations, age anatomy, outlines and common baseline. Rows: idle blink, right-facing walk, eat, drink, curled sleep, four frames each. Keep consistent markings across poses and same age as reference 1. Match the simple pastel 2D cartoon style with dot eyes/w mouth; no realistic fur or 3D. Genuine transparent alpha; no background no props no labels no text no borders no emoji. Do not alter poses or scale, do not add or omit frames.

## smokin adult

Dosya: `smokin-adult.png`

Tam prompt:

Edit reference 1 (the adult age orange cat atlas) by recoloring ONLY the coat to charcoal and white tuxedo with white chest muzzle and paw tips, using reference 2 for coat identity. Preserve exact canvas size, all TWENTY poses in FOUR COLUMNS by FIVE ROWS, locations, age anatomy, outlines and common baseline. Rows: idle blink, right-facing walk, eat, drink, curled sleep, four frames each. Keep consistent markings across poses and same age as reference 1. Match the simple pastel 2D cartoon style with dot eyes/w mouth; no realistic fur or 3D. Genuine transparent alpha; no background no props no labels no text no borders no emoji. Do not alter poses or scale, do not add or omit frames.

## calico adult

Dosya: `calico-adult.png`

Tam prompt:

Edit reference 1 (the adult age orange cat atlas) by recoloring ONLY the coat to white calico with simple orange and charcoal patches, using reference 2 for coat identity. Preserve exact canvas size, all TWENTY poses in FOUR COLUMNS by FIVE ROWS, locations, age anatomy, outlines and common baseline. Rows: idle blink, right-facing walk, eat, drink, curled sleep, four frames each. Keep consistent markings across poses and same age as reference 1. Match the simple pastel 2D cartoon style with dot eyes/w mouth; no realistic fur or 3D. Genuine transparent alpha; no background no props no labels no text no borders no emoji. Do not alter poses or scale, do not add or omit frames.

## furniture-1

Dosya: `furniture-1.png`

Tam prompt:

PatiLife production furniture sprite atlas, match reference's simple rounded 2D cartoon props, warm brown medium outlines, pastel cream mint peach honey wood, minimal shading. Genuine transparent alpha, no scenery, no characters, no shadows outside objects. EXACTLY FOUR COLUMNS by 4 ROWS, 16 separate objects. Equal square cells, whole object fully inside each cell with at least 15% empty transparent margins and stable baseline. Camera front three-quarter slightly from above, same perspective for all. Objects in EXACT reading order row by row: 1: low mint circulating water fountain with a small spout; 2: peach slow feeding bowl with raised internal ridges; 3: cream cat food puzzle board with small treat wells; 4: mint timed automatic feeder with a kibble hopper; 5: round nest bed with raised cream rim; 6: simple felt cave with round doorway; 7: flat cushioned window ledge bed, no window attached; 8: low freestanding fabric cat hammock; 9: flat blue cooling mat; 10: flat corrugated cardboard scratching pad; 11: inclined cardboard scratching ramp; 12: small wall mount rectangular sisal scratching panel; 13: small two-level cat tree with round platform; 14: larger three-level cat tree, entire tree visible; 15: small fabric toy mouse; 16: small soft fabric ball. No labels no numbers no letters no text no emoji no grid borders. Numbering is instruction only, do not print it. Do not merge cells, omit or duplicate items. No photorealism, no 3D. Make each object a clear distinct isolated usable game sprite.

## furniture-2

Dosya: `furniture-2.png`

Tam prompt:

PatiLife production furniture sprite atlas, match reference's simple rounded 2D cartoon props, warm brown medium outlines, pastel cream mint peach honey wood, minimal shading. Genuine transparent alpha, no scenery, no characters, no shadows outside objects. EXACTLY FOUR COLUMNS by 4 ROWS, 16 separate objects. Equal square cells, whole object fully inside each cell with at least 15% empty transparent margins and stable baseline. Camera front three-quarter slightly from above, same perspective for all. Objects in EXACT reading order row by row: 1: cat wand toy with short handle, string and simple feather; 2: circular ball track toy with visible ball; 3: low wooden treat maze toy; 4: short soft fabric tunnel; 5: Y shaped two entrance fabric tunnel; 6: low freestanding broad shelf; 7: three low pet steps; 8: simple cube hideout with round doorway; 9: wide low open litter tray with clean sand; 10: litter tray with low privacy side panels; 11: rectangular textured litter catching mat; 12: small soft grooming brush; 13: neatly folded bath towel on low mat; 14: low freestanding window observation platform, no window; 15: small broad observation side table; 16: simple safety mesh window corner frame, no wall. No labels no numbers no letters no text no emoji no grid borders. Numbering is instruction only, do not print it. Do not merge cells, omit or duplicate items. No photorealism, no 3D. Make each object a clear distinct isolated usable game sprite.

## furniture-3

Dosya: `furniture-3.png`

Tam prompt:

PatiLife production furniture sprite atlas, match reference's simple rounded 2D cartoon props, warm brown medium outlines, pastel cream mint peach honey wood, minimal shading. Genuine transparent alpha, no scenery, no characters, no shadows outside objects. EXACTLY FOUR COLUMNS by 2 ROWS, 8 separate objects. Equal square cells, whole object fully inside each cell with at least 15% empty transparent margins and stable baseline. Camera front three-quarter slightly from above, same perspective for all. Objects in EXACT reading order row by row: 1: short soft folded shade curtain on small freestanding frame; 2: small low wooden garden bench; 3: simple low warm night lamp; 4: small open keepsake box with blank paper inside; 5: small freestanding photo display board, blank pastel photo rectangles, no text; 6: woven toy basket with ball inside; 7: short pot of safe cat grass; 8: soft flat reading floor cushion with a closed plain book. No labels no numbers no letters no text no emoji no grid borders. Numbering is instruction only, do not print it. Do not merge cells, omit or duplicate items. No photorealism, no 3D. Make each object a clear distinct isolated usable game sprite.

