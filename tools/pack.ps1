# Compress-Archive (PS 5.1) writes "\" separators that Linux hosts treat as file names, so entries are built by hand with "/".
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$root = Split-Path $PSScriptRoot -Parent
$src = Join-Path $root "dist"
$out = Join-Path $root "release\kervan-tycoon-web.zip"
New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null
Remove-Item $out -Force -ErrorAction SilentlyContinue
$z = [IO.Compression.ZipFile]::Open($out, "Create")
$n = 0
Get-ChildItem $src -Recurse -File | ForEach-Object {
  $name = $_.FullName.Substring($src.Length + 1).Replace("\", "/")
  [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($z, $_.FullName, $name, "Optimal")
  $n++
}
$z.Dispose()
"{0} dosya, {1:N1} MB -> {2}" -f $n, ((Get-Item $out).Length / 1MB), $out
