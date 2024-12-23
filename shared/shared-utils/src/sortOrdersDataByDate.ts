import { CreateOrderModelTypes } from "@omenai/shared-types/index";
interface FormattedObject extends CreateOrderModelTypes {
  createdAt: string; // Updated type for formatted date
}

interface FinalObject {
  date: string;
  data: CreateOrderModelTypes[];
}

export function sortOrdersDataByDate(
  inputArray: CreateOrderModelTypes[]
): FinalObject[] {
  // Format and sort the data
  const formattedData: FormattedObject[] = inputArray
    .map((item) => {
      const createdAt = new Date(item.createdAt);
      const monthYear = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(createdAt);

      return {
        ...item,
        createdAt: monthYear,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Structure the data into the final format using reduce
  const finalData: FinalObject[] = formattedData.reduce(
    (result: FinalObject[], item: FormattedObject) => {
      const existingMonthYear = result.find(
        (entry) => entry.date === item.createdAt
      );

      if (existingMonthYear) {
        existingMonthYear.data.push(item);
      } else {
        result.push({
          date: item.createdAt,
          data: [item],
        });
      }

      return result;
    },
    []
  );

  return finalData;
}
