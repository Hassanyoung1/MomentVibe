import { expect } from "chai";
import request from "supertest";
import app from "../../index.mjs";

describe("Auth API - User Registration", () => {
  it("should register a new user with valid details", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ 
        email: "john@example.com", 
        password: "SecurePass123!" 
      });

    expect(res.status).to.equal(201); // Success status
    expect(res.body).to.have.property("token"); // JWT should be returned
    expect(res.body).to.have.property("user");
    expect(res.body.user.email).to.equal("john@example.com"); // Correct email stored
  });
});
