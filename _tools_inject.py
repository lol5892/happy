# -*- coding: utf-8 -*-
import os
ROOT = os.path.dirname(os.path.abspath(__file__))
idx_path = os.path.join(ROOT, "index.html")
content = open(idx_path, encoding="utf-8").read()
journal = open(os.path.join(ROOT, "_journal.html"), encoding="utf-8").read()

# 1) Заголовок и подзаголовок истории
content = content.replace(
    "<h2>История маленького Мироши</h2>",
    "<h2>История нашего Мирона</h2>"
)
content = content.replace(
    """      <p class="lead">
        20 июня 2025 года в нашей семье случилось самое большое чудо.
        Папа <b>Антон</b> и мама <b>Таня</b> встретили своего сыночка.
        Вот как пролетел этот волшебный годик.
      </p>""",
    """      <p class="lead">
        От маминого животика до первых шагов. Папа <b>Антон</b> и мама <b>Таня</b>
        собрали здесь самые тёплые моменты первого года жизни Мироши — день за днём.
      </p>"""
)

# 2) Заменяем таймлайн на журнал
start_marker = '    <div class="timeline">'
i_start = content.index(start_marker)
i_end = content.index("  </section>", i_start)
new_block = '    <div class="journal">\n' + journal + "\n    </div>\n"
content = content[:i_start] + new_block + content[i_end:]

# 3) Удаляем секцию галереи (всё дублируется в журнале)
g_start = content.index("  <!-- ====================== ГАЛЕРЕЯ")
g_end = content.index("  </section>", g_start) + len("  </section>")
# подчистим лишние пустые строки вокруг
content = content[:g_start] + content[g_end:].lstrip("\n")

open(idx_path, "w", encoding="utf-8").write(content)
print("injected OK; length:", len(content))
