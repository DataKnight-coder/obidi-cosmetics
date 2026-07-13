async function run() {
  const repo = 'DataKnight-coder/obidi-cosmetics';
  const res = await fetch(`https://api.github.com/repos/${repo}/actions/runs?per_page=5`);
  const data = await res.json();
  const runs = data.workflow_runs.filter(r => r.name === 'Deploy Staging');
  const run = runs.find(r => r.head_sha === '8d8e6118d8e611' || r.head_sha.startsWith('8d8e611'));
  if (!run) {
    console.log("Run not found. Latest runs:", runs.map(r => ({id: r.id, sha: r.head_sha})));
    return;
  }
  console.log("Found run:", run.id);
  const jobsRes = await fetch(run.jobs_url);
  const jobsData = await jobsRes.json();
  const failedJob = jobsData.jobs.find(j => j.conclusion === 'failure');
  if (!failedJob) {
    console.log("No failed job found. Jobs:", jobsData.jobs.map(j => ({name: j.name, conclusion: j.conclusion})));
    return;
  }
  console.log("Failed job ID:", failedJob.id, failedJob.name);
  const logRes = await fetch(`https://api.github.com/repos/${repo}/actions/jobs/${failedJob.id}/logs`);
  const logText = await logRes.text();
  const lines = logText.split('\n');
  console.log("--- LOGS ---");
  console.log(lines.slice(-150).join('\n'));
}
run().catch(console.error);
