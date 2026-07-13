#!/usr/bin/env python3
# Gera index.html a partir de app.jsx (fonte React) + template.html.
# Uso: python3 build.py
import os
here=os.path.dirname(os.path.abspath(__file__))
comp=open(os.path.join(here,"app.jsx"),encoding="utf-8").read()
comp=comp.replace('import { useState, useEffect, useRef } from "react";','const { useState, useEffect, useRef } = React;',1)
comp=comp.replace('export default function App() {','function App() {',1)
assert 'const { useState, useEffect, useRef } = React;' in comp and 'export default' not in comp, "transform falhou"
assert '</script>' not in comp, "app.jsx contém </script>"
tmpl=open(os.path.join(here,"template.html"),encoding="utf-8").read()
out=tmpl.replace("__COMPONENT__", comp, 1)
open(os.path.join(here,"index.html"),"w",encoding="utf-8").write(out)
print("index.html gerado:", len(out), "bytes")
