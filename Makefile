PYTHON ?= .venv/bin/python
.PHONY: iniciar test verificar vista demo
iniciar:
	bash iniciar.sh
verificar:
	$(PYTHON) scripts/verificar_repositorio.py
	$(PYTHON) scripts/generar_vista.py --comprobar
	bash -n iniciar.sh
	node --check web/app.js
	node --check web/trabajo.js
	node --check web/lectura.js
	node --check web/demo.js
	node --check web/visuales.js
vista:
	$(PYTHON) scripts/generar_vista.py
test: verificar
	$(PYTHON) -m pytest pruebas -q
	npm test
demo:
	$(PYTHON) scripts/generar_demo.py
