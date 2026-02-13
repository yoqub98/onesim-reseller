export function formatPackageDataLabel(pkg, unlimitedLabel = "Cheksiz") {
  if (!pkg) {
    return "-";
  }

  if (pkg.dataLabel) {
    return pkg.dataLabel;
  }

  const dataGb = Number(pkg.dataGb);
  if (dataGb === -1 || dataGb === 0 || Number.isNaN(dataGb)) {
    return unlimitedLabel;
  }

  return `${dataGb}GB`;
}
