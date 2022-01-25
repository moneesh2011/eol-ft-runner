function cukeCommandBuilder(args) {
    let cucumberCmd = [
      args.cukeExePath,
      args.featurePath
    ];
    
    cucumberCmd.push("--require", args.stepDefPath);
    cucumberCmd.push("--require", args.hookPath);
    cucumberCmd.push("--require", args.supportPath);
    cucumberCmd.push("--require", args.worldPath);
    if (args.tags) cucumberCmd.push("--tags", args.tags);
    cucumberCmd.push("--format", args.reportFormat);
    cucumberCmd.push("--parallel", args.cores);
    cucumberCmd.push("--world-parameters", args.worldParams);
    cucumberCmd.push("--publish-quiet");
    if (args.retry) cucumberCmd.push("--retry", args.retry);
    
    return cucumberCmd;
}

module.exports = {
    cukeCommandBuilder: cukeCommandBuilder
};