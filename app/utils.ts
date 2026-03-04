import { useEffect, useRef } from "react";
import { MenuItem, sections } from "./db/database";

// export const SECTION_LIST_MOCK_DATA = [
//   {
//     title: "Appetizers",
//     data: [
//       {
//         id: "1",
//         title: "Pasta",
//         price: "10",
//       },
//       {
//         id: "3",
//         title: "Pizza",
//         price: "8",
//       },
//     ],
//   },
//   {
//     title: "Salads",
//     data: [
//       {
//         id: "2",
//         title: "Caesar",
//         price: "2",
//       },
//       {
//         id: "4",
//         title: "Greek",
//         price: "3",
//       },
//     ],
//   },
// ];

/**
 * 3. Implement this function to transform the raw data
 * retrieved by the getMenuItems() function inside the database.js file
 * into the data structure a SectionList component expects as its "sections" prop.
 * @see https://reactnative.dev/docs/sectionlist as a reference
 */
export function getSectionListData(data: MenuItem[]) {
  return sections.reduce(
    (acc, section) => {
      const itemsInSection = data.filter((menuItem) => menuItem.category === section);
      if (itemsInSection && itemsInSection.length > 0) {
        acc.push({ title: section, data: itemsInSection });
      }
      return acc;
    },
    [] as { title: string; data: MenuItem[] }[],
  );
}

export function useUpdateEffect(effect, dependencies = []) {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      return effect();
    }
  }, dependencies);
}
