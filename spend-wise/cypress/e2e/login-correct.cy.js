/// <reference types="Cypress" />

describe("login tests", () => {
  it("does work with correct credentials", () => {
    cy.eyesOpen({
      appName: "Personal Budget",
      testName: "Fill form to login",
    });
    cy.visit("/home");
    cy.contains("a.nav-link", "Login / Sign up").click();

    cy.hash().should("eq", "#/login");

    cy.eyesCheckWindow({
      tag: "Login page",
      target: "window",
      fully: true,
    });
    cy.screenshot();

    cy.get("[data-cy=username").type("r@a.com").should("have.value", "r@a.com");
    cy.get("[data-cy=password").type("test123").should("have.value", "test123");
    cy.get("[data-cy=login-form").submit();

    cy.hash().should("eq", "#/dashboard");

    cy.eyesCheckWindow({
      tag: "Dashboard",
      target: "window",
      fully: true,
    });
    cy.screenshot();

    cy.eyesClose();
  });
});
