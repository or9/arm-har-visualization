/// <reference types="Cypress" />

describe("index.html", () => {
	it("should load", () => {
		cy.visit("/");
	});
});
