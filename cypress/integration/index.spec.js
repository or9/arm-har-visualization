/// <reference types="Cypress" />

describe("index.html", () => {
	it("should load", () => {
		cy.visit("/");
	});

	it("should have a header", () => {
		cy.get("header")
			.should("have.class", "template--section")
			.and("have.class", "section--header");
	});

	it("should have a section", () => {
		cy.get("section")
			.should("have.class", "content")
			.and("have.id", "content");
	});

	it("should have a footer", () => {
		cy.get("footer")
			.should("have.class", "template--section")
			.and("have.class", "section--footer");
	});

	describe("header", () => {
		it("should have a heading", () => {
			cy.get("header > h1")
				.contains("HAR Visualization Tool");
		});

		it("should have a link to the source code", () => {
			cy.get("header > a")
				.contains("Source Code");
		});

		it("should have descriptive text", () => {
			cy.get("header > p")
				.contains("This tool compares HAR (HTTP Archive) files,");
		});

		it("should have a 'more' link", () => {
			cy.get("header > p + .more--link")
				.should("not.have.class", "expanded")
				.click()
				.should("have.class", "expanded")
				.click()
				.should("not.have.class", "expanded")

		});

		it("should collapse when a row changes", () => {
			cy.get("arm-row-dropzone")
				.then(($el) => {
					$el[0].setAttribute("has-chart", "true")
					$el.trigger("change");
				})
				.then(() => {
					cy.get("header")
						.should("have.class", "collapsed");
				});
		});
	});

	describe("content section", () => {
		it("should have a dropzone row", () => {
			cy.get("section > arm-row-dropzone");
		});
	});

	describe("footer", () => {
		it("should have a copyright with the current year", () => {
			cy.get("footer")
				.contains(new Date().getFullYear())
				.contains("by Rahman Malik");
		});
	});
});
