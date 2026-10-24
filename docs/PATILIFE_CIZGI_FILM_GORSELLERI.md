# PatiLife — Çizgi film görsel üretim kaydı

Tarih: 2026-10-23. Araç: built-in image_gen. CLI kullanılmadı.

Referanslar: `sprite_preview/sarman/sarman_transparan_2.png` ve `sprite_preview/sahneler/salon.jpg`. Stil: sade yüz, yuvarlak oranlar, kahverengi kontur, pastel renkler. Gerçekçi kürk/3D kullanılmaz.

Önceki gerçekçi kedi, ev ve açılış görselleri reddedildi; `backups/rejected-realistic-art/` altına taşındı ve dağıtım kaynaklarından çıkarıldı. Mevcut salon arka planı yeniden kullanılıyor.

Dört yavru için ayrı 4 sütun × 2 satır atlas: üst sıra bekleme/göz kırpma, alt sıra yürüme. Alfa sınırları yalnızca okunarak kare metaverisi çıkarıldı; PNG üzerinde Python ile düzenleme yapılmadı. Canvas oynatıcı ortak ölçek ve zemin çizgisine hizalar. Her atlasın sekiz karesi dolu, gerçek alfa mevcut. Yeni animasyonlar henüz gerçek tarayıcıda/cihazda gözle doğrulanmadı. Yeme, içme, uyuma ve diğer eylem atlasları henüz yoktur.

## Sarman yavru atlası

Dosya: `sprite_preview/patilife_v2/assets/sarman-kitten-cartoon.png`

Tam prompt:

Use case: stylized-concept. Production transparent sprite atlas for PatiLife 2D mobile cartoon cat game. Reference image 1 is the EXISTING game's cartoon cat strip: match its very simple cream/orange shapes, tiny dot eyes, little w mouth, warm brown smooth medium outline, huge round head, short rounded legs, NO individual fur hairs. Reference image 2 is existing pastel cartoon living room: match its visual simplicity and palette, not photographic detail. Make a younger ORANGE TABBY kitten variant, cream body, orange head patch and orange striped tail, charming simple flat 2D cartoon, tiny cream belly, consistent model in every frame. OUTPUT: exactly FOUR COLUMNS by TWO ROWS, eight equal square cells, on genuine transparent alpha, no text labels, no grid lines, no numbers, no shadows outside character. Each cell full kitten entirely inside, same size, generous transparent 15 percent margins, common floor baseline at 82 percent cell height. Row 1: four-frame IDLE loop, 3/4 front facing right, seated resting with paws on ground: eyes open, half blink, fully closed blink, eyes open with slight tail sway. Row 2: four-frame WALK loop side/3/4 right facing on FOUR PAWS: left front/right rear forward, passing pose, opposite legs forward, passing pose. Cat should not stand on hind legs. Same scale and head/tail markings throughout, baseline stable. Row 2 paw changes must be visibly distinct for walking, not four copies. No realistic anatomy rendering, no realistic fur, no painterly hair, no glossy 3D, no cinematic shading, no clothes, no props, no emoji. This must read like the provided simple 2D game character, not a lifelike pet portrait. Prefer 1024x512 aspect ratio with 256x256 equal cells.

## tekir yavru atlası

Dosya: `sprite_preview/patilife_v2/assets/tekir-kitten-cartoon.png`

Tam prompt:

Edit target: the supplied orange kitten sprite atlas. Produce a coat-color variant ONLY: brown and cream mackerel TABBY, warm brown stripes on head, sides and tail, cream muzzle and belly. Preserve EXACT original canvas size, transparent alpha, exact 4 columns by 2 rows grid, every cell location, eight poses, body proportions, tiny dot eyes, w mouth, brown outline thickness, baseline, camera and frame composition. First row four idle blink frames, second row four right-facing walk frames. Do not rearrange, resize, add/remove frames or change animation poses. Same simple pastel flat 2D cartoon character as supplied image; no realistic fur, no lifelike eyes, no 3D. Change only the cream/orange coat coloring and simple markings to the requested coat, keeping markings consistent between all eight frames. No labels, no lettering, no emojis. Genuine transparent alpha background.

## smokin yavru atlası

Dosya: `sprite_preview/patilife_v2/assets/smokin-kitten-cartoon.png`

Tam prompt:

Edit target: the supplied orange kitten sprite atlas. Produce a coat-color variant ONLY: black and white TUXEDO, charcoal head and back, white muzzle chest belly and paw tips, black tail. Preserve EXACT original canvas size, transparent alpha, exact 4 columns by 2 rows grid, every cell location, eight poses, body proportions, tiny dot eyes, w mouth, brown outline thickness, baseline, camera and frame composition. First row four idle blink frames, second row four right-facing walk frames. Do not rearrange, resize, add/remove frames or change animation poses. Same simple pastel flat 2D cartoon character as supplied image; no realistic fur, no lifelike eyes, no 3D. Change only the cream/orange coat coloring and simple markings to the requested coat, keeping markings consistent between all eight frames. No labels, no lettering, no emojis. Genuine transparent alpha background.

## calico yavru atlası

Dosya: `sprite_preview/patilife_v2/assets/calico-kitten-cartoon.png`

Tam prompt:

Edit target: the supplied orange kitten sprite atlas. Produce a coat-color variant ONLY: white CALICO with simple clearly separated orange and charcoal patches on ears head back and tail. Preserve EXACT original canvas size, transparent alpha, exact 4 columns by 2 rows grid, every cell location, eight poses, body proportions, tiny dot eyes, w mouth, brown outline thickness, baseline, camera and frame composition. First row four idle blink frames, second row four right-facing walk frames. Do not rearrange, resize, add/remove frames or change animation poses. Same simple pastel flat 2D cartoon character as supplied image; no realistic fur, no lifelike eyes, no 3D. Change only the cream/orange coat coloring and simple markings to the requested coat, keeping markings consistent between all eight frames. No labels, no lettering, no emojis. Genuine transparent alpha background.

## Çizgi film açılış sahnesi

Dosya: `sprite_preview/patilife_v2/assets/opening-cartoon.png`

Tam prompt:

Use case illustration-story. A single opening story panel for PatiLife 2D CARTOON kitten adoption game. Input reference 1: the game's cat sprite atlas; copy its simple cute round shapes, dot eyes, warm brown outlines, cream/orange flat coloring. Reference 2: the game's original living room art; match pastel peach, mint, cream colors, delicate outlines, simple clean illustration. Scene: rainy neighborhood sidewalk, exactly FOUR young adult friends (two women two men) in simplified friendly cartoon style, umbrellas, crouching at a sheltered cardboard box under an awning. Exactly FOUR tiny kittens inside the dry box: orange tabby, brown tabby, black-white tuxedo, white-orange-black calico; all drawn in the same very simple round dot-eyed cartoon style as reference 1, NOT realistic. Gentle optimistic adoption story. Full composition vertical, four friends and four kittens all fully readable. Soft pastel cel-shaded 2D animation look, clean large shapes, minimal texture, no realistic anatomy or fur or realistic faces, no cinematic lighting, no painterly realism, no 3D, no photographic detail. No text no speech bubbles no typography no symbols no emojis no UI. Keep bottom third for box/kittens, friends above, no cropping faces.

