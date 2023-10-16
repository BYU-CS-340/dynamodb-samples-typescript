export class Visit {
  visitor: string;
  visit_location: string;
  visit_count: number;

  constructor(
    visitor: string,
    visit_location: string,
    visit_count: number = 0
  ) {
    this.visitor = visitor;
    this.visit_location = visit_location;
    this.visit_count = visit_count;
  }

  toString(): string {
    return (
      "Visit{" +
      "visitor='" +
      this.visitor +
      "'" +
      ", location='" +
      this.visit_location +
      "'" +
      ", visit_count=" +
      this.visit_count +
      "}"
    );
  }
}
