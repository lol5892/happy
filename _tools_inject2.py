# -*- coding: utf-8 -*-
import os
ROOT = os.path.dirname(os.path.abspath(__file__))
idx = os.path.join(ROOT, "index.html")
content = open(idx, encoding="utf-8").read()
story = open(os.path.join(ROOT, "_story.html"), encoding="utf-8").read()
gallery = open(os.path.join(ROOT, "_gallery.html"), encoding="utf-8").read()

# 1) Вернуть вводный текст истории
content = content.replace(
    """      <p class="lead">
        От маминого животика до первых шагов. Папа <b>Антон</b> и мама <b>Таня</b>
        собрали здесь самые тёплые моменты первого года жизни Мироши — день за днём.
      </p>""",
    """      <p class="lead">
        20 июня 2025 года в нашей семье случилось самое большое чудо.
        Папа <b>Антон</b> и мама <b>Таня</b> встретили своего сыночка.
        Вот как пролетел этот волшебный первый годик.
      </p>"""
)

# 2) Заменить блок журнала на таймлайн
i_start = content.index('    <div class="journal">')
i_end = content.index("  </section>", i_start)
new_block = '    <div class="timeline">\n' + story + "\n    </div>\n"
content = content[:i_start] + new_block + content[i_end:]

# 3) Вернуть секцию галереи перед RSVP
gallery_section = (
    '  <!-- ====================== ГАЛЕРЕЯ ====================== -->\n'
    '  <section class="section gallery">\n'
    '    <div class="section-head reveal">\n'
    '      <span class="kicker">★ мгновения счастья ★</span>\n'
    '      <h2>Наши любимые моменты</h2>\n'
    '      <p class="lead">Самые тёплые кадры этого волшебного года.</p>\n'
    '    </div>\n'
    '    <div class="gallery-grid reveal">\n'
    f'{gallery}\n'
    '    </div>\n'
    '  </section>\n\n'
)
marker = "  <!-- ====================== RSVP ====================== -->"
content = content.replace(marker, gallery_section + marker, 1)

open(idx, "w", encoding="utf-8").write(content)
print("done; length:", len(content))
