export interface TemplateMeta {
  url: string;
  sheetName: string;
  headerRow: number;
  dataStartRow: number;
  columnCount: number;
  fileNamePrefix: string;
  backupSheetName?: string;
  backupHeaderRow?: number;
  backupDataStartRow?: number;
}

export const TEMPLATE_META = {
  expenseSource: {
    url: "/templates/수입지출처_일괄등록_양식.xlsx",
    sheetName: "수입지출처 일괄등록",
    headerRow: 1,
    dataStartRow: 2,
    columnCount: 9,
    fileNamePrefix: "수입지출처",
  },
  namedIncome: {
    url: "/templates/수입내역_일괄등록_양식.xlsx",
    sheetName: "수입 내역 일괄등록",
    headerRow: 5,
    dataStartRow: 6,
    columnCount: 16,
    fileNamePrefix: "수입내역_기명",
  },
  anonIncome: {
    url: "/templates/익명수입자일괄등록_양식.xlsx",
    sheetName: "수입 내역 일괄등록",
    headerRow: 1,
    dataStartRow: 2,
    columnCount: 16,
    backupSheetName: "Sheet2",
    backupHeaderRow: 1,
    backupDataStartRow: 2,
    fileNamePrefix: "익명수입자",
  },
} as const satisfies Record<string, TemplateMeta>;
