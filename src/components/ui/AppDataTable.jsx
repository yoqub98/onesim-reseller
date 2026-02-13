import { Box, Grid, Text } from "@chakra-ui/react";
import { uiColors } from "../../design-system/tokens";

function AppDataTable({
  minWidth,
  columns,
  headers,
  children,
  headerBg = uiColors.surfaceSoft,
  ...props
}) {
  return (
    <Box overflowX="auto" {...props}>
      <Box minW={minWidth}>
        <Grid
          templateColumns={columns}
          bg={headerBg}
          borderBottomWidth="1px"
          borderColor={uiColors.border}
        >
          {headers.map((header) => {
            const headerConfig =
              typeof header === "string" ? { label: header } : header;

            return (
              <Text
                key={headerConfig.key || headerConfig.label}
                px={6}
                py={4}
                fontSize="xs"
                fontWeight="700"
                color="#5f718b"
                textAlign={headerConfig.align || "left"}
              >
                {headerConfig.label}
              </Text>
            );
          })}
        </Grid>
        {children}
      </Box>
    </Box>
  );
}

function AppDataTableRow({ columns, children, ...props }) {
  return (
    <Grid
      templateColumns={columns}
      alignItems="center"
      borderBottomWidth="1px"
      borderColor={uiColors.border}
      {...props}
    >
      {children}
    </Grid>
  );
}

function AppDataTableCell({ children, align = "left", ...props }) {
  return (
    <Box px={6} py={3.5} textAlign={align} {...props}>
      {children}
    </Box>
  );
}

export { AppDataTable, AppDataTableCell, AppDataTableRow };
