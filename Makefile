.PHONY: iniciar test demo
iniciar:
	bash iniciar.sh
test:
	.venv/bin/python -m pytest pruebas -q
demo:
	.venv/bin/python scripts/generar_demo.py
