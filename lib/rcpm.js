var exports = module.exports = {};

var exec = require('child_process').execSync;

exports.showInfo = function (packageName) {

  var source = null;
  try {
    source = '' + exec('cat $HOME/.rcpm/source.conf');
  } catch (e) {
    console.log("ERROR: Error reading ~/.rcpm/source.conf");
  }

  if (source == null || source.length == 0) {
    console.log("Null source");
    return;
  }

  source = source.replace('\r\n', '').replace('\n', '');

  console.log('Source: ' + source);

  var meta = null;
  try {
    meta = JSON.parse(exec('wget -qO- ' + source + packageName + '/meta.json'));
  } catch (e) {
    console.log("ERROR: Error downloading meta.json for package: " + packageName);
  }

  if (meta == null) {
    console.log("Null remote meta");
    return;
  }

  var packageFile = meta.file;
  var timestamp = meta.timestamp;

  var installedTimestamp = 0;

  try {
    installedTimestamp = exec('cat $HOME/.rcpm/' + packageName);
  } catch (e) {}

  console.log('Latest remote file: ' + packageFile);
  console.log('Remote updated at: ' + new Date(timestamp * 1000));
  if (installedTimestamp != 0) console.log('Installed version: ' + new Date(installedTimestamp * 1000));
}

exports.downloadAndInstall = function (packageName, update) {
  var source = null;
  try {
    source = '' + exec('cat $HOME/.rcpm/source.conf');
  } catch (e) {
    console.log("ERROR: Error reading ~/.rcpm/source.conf");
  }

  if (source == null || source.length == 0) {
    console.log("Null source");
    return;
  }

  source = source.replace('\r\n', '').replace('\n', '');

  console.log('Source: ' + source);

  var meta = null;
  try {
    meta = JSON.parse(exec('wget -qO- ' + source + packageName + '/meta.json'));
  } catch (e) {
    console.log("ERROR: Error downloading meta.json for package: " + packageName);
  }

  if (meta == null) {
    console.log("Null remote meta");
    return;
  }

  var packageFile = meta.file;
  var timestamp = meta.timestamp;

  if (update == true) {
    var installedTimestamp = 0;

    try {
      installedTimestamp = exec('cat $HOME/.rcpm/' + packageName + '.install');
      if (installedTimestamp >= timestamp) {
        console.log("No update available.");
        return;
      }
    } catch (e) {
      console.log('No previous version installed.');
    }
  }

  exec('mkdir -p $HOME/.rcpm/');
  exec('echo ' + timestamp + ' > $HOME/.rcpm/' + packageName + '.install');
  exec('wget ' + source + packageName + '/' + packageFile);
  exec('dpkg -i ' + packageFile);
  exec('rm -rf ' + packageFile);
}
