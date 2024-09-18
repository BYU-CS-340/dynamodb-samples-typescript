export class Visitor {
  name: string;
  email: string;
  city: string;
  state: string;

  constructor(name: string, email: string, city: string, state: string) {
    this.name = name;
    this.email = email;
    this.city = city;
    this.state = state;
  }

  toString(): string {
    return (
      "Visitor{" +
      "name='" +
      this.name +
      "'" +
      ", email='" +
      this.email +
      "'" +
      ", city=" +
      this.city +
      ", state=" +
      this.state +
      "}"
    );
  }
}
