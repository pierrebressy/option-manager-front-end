import DataTable, { createTheme } from "react-data-table-component";
import * as consts from "../services/constants";

createTheme(
  "solarized",
  {
    text: {
      primary: "#268bd2",
      secondary: "#FFFFFF",
    },
    background: {
      default: "#000000",
    },
    highlightOnHover: {
      default: "#222222",
    },
    striped: {
      default: "rgba(203, 214, 226, 0.180179)",
    },
  },
  "dark",
);

function OptionsListComponent(
  title: any,
  columns: any,
  data: any,
  handle: any,
) {
  return (
    <DataTable
      title={title}
      columns={columns}
      data={data}
      highlightOnHover={true}
      pagination={true}
      paginationPerPage={consts.TABLE_LIST_ELEMENTS_PER_PAGE}
      onRowClicked={(row) => handle(row)}
      theme="solarized"
      dense={true}
    />
  );
}

export default OptionsListComponent;
