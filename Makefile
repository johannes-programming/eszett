.PHONY: zip clean

ZIP := dist/eszett.zip
SRC_DIR := src/eszett

zip: $(ZIP)

$(ZIP): $(SRC_DIR)
	@mkdir -p $(dir $(ZIP))
	@rm -f $(ZIP)
	@cd $(SRC_DIR) && zip -rq ../../$(ZIP) .

clean:
	@rm -f $(ZIP)
