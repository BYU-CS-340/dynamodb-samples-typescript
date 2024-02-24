import { Visit } from "./entity/Visit";
import { DataPage } from "./entity/DataPage";
import { VisitsDAO } from "./dao/VisitsDAO";

class Main {
  async run() {
    const dao = new VisitsDAO();

    /**
     * Delete old items
     */
    await Promise.all([
      dao.deleteVisit(new Visit("matt", "utah")),
      dao.deleteVisit(new Visit("matt", "guatemala")),
      dao.deleteVisit(new Visit("matt", "idaho")),
      dao.deleteVisit(new Visit("matt", "italy")),
      dao.deleteVisit(new Visit("elliot", "italy")),
      dao.deleteVisit(new Visit("nate", "italy")),
      dao.deleteVisit(new Visit("adam", "italy")),
    ]);

    /**
     * Get an Item
     */
    const count = await dao.getVisitCount(new Visit("matt", "guatemala"));
    console.log(
      "(Just getting) Matt has visited Guatemala " + count + " time(s)"
    );

    /**
     * Update an item, one of which exists (guatemala), one of which is new (utah)
     */
    await dao.recordVisit(new Visit("matt", "utah"));
    await dao.recordVisit(new Visit("matt", "guatemala"));

    const countGuatemala = await dao.getVisitCount(
      new Visit("matt", "guatemala")
    );
    console.log(
      "(After recording) Matt has visited Guatemala " +
        countGuatemala +
        " time(s)"
    );

    const countUtah: number = await dao.getVisitCount(new Visit("matt", "utah"));
    console.log(
      "(After recording) Matt has visited utah " + countUtah + " time(s)"
    );

    /**
     * Delete an item
     */
    await dao.deleteVisit(new Visit("matt", "utah"));
    const countUtah2 = await dao.getVisitCount(new Visit("matt", "utah"));
    console.log(
      "(After deletion) Matt has visited utah " + countUtah2 + " time(s)"
    );

    /**
     * Add more items
     */
    await Promise.all([
      dao.recordVisit(new Visit("matt", "idaho")),
      dao.recordVisit(new Visit("matt", "italy")),
      dao.recordVisit(new Visit("elliot", "italy")),
      dao.recordVisit(new Visit("nate", "italy")),
      dao.recordVisit(new Visit("adam", "italy")),
    ]);

    /**
     * Get the first page (lastlocation = null) of items
     */
    const page: DataPage<Visit> = await dao.getVisitedLocations("matt");
    const visits: Visit[] = page.values;
    const hasMorePages = page.hasMorePages;
    console.log(
      "Matt has visited: " +
        visits +
        ", and are there more pages? " +
        hasMorePages
    );
    this.verify(hasMorePages);

    const lastLocation = visits[visits.length - 1].visit_location;

    /**
     * Get the second page (lastlocation = the last thing returned from the first page) of items
     */
    const page2: DataPage<Visit> = await dao.getVisitedLocations(
      "matt",
      lastLocation
    );
    const visits2: Visit[] = page2.values;
    const hasMorePages2 = page2.hasMorePages;
    console.log(
      "Matt has also visited: " +
        visits2 +
        ", and are there more pages? " +
        hasMorePages2
    );
    this.verify(!hasMorePages2);

    /**
     * Using an Index: Get the first page (lastVisitor = null) of items
     */
    const page3: DataPage<Visit> = await dao.getVisitors("italy");
    const visitsToItaly: Visit[] = page3.values;
    const hasMorePages3: boolean = page3.hasMorePages;
    console.log(
      "Italy was visited by: " +
        visitsToItaly +
        ", and are there are more pages? " +
        hasMorePages3
    );
    this.verify(hasMorePages3);

    const lastVisitor: string = visitsToItaly[visitsToItaly.length - 1].visitor;

    /**
     * Using an Index: Get the second page (lastVisitor = the last thing returned from the first page) of items
     */
    const page4: DataPage<Visit> = await dao.getVisitors("italy", lastVisitor);
    const visitsToItaly2: Visit[] = page4.values;
    const hasMorePages4: boolean = page4.hasMorePages;
    console.log(
      "Italy was also visited by: " +
        visitsToItaly2 +
        ", and are there are more pages? " +
        hasMorePages4
    );
    this.verify(!hasMorePages4);
  }

  private verify(b: boolean): void {
    if (!b) {
      throw Error("Verficiation failed.");
    }
  }
}

function run() {
  new Main().run();
}

run();
