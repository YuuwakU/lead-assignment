const [_, __, leadsCSV, agentsCSV] = process.argv
const csv = require('csvtojson')

const agentsPromise = csv().fromFile(agentsCSV)
const leadsPromise = csv().fromFile(leadsCSV)

Promise.all([agentsPromise, leadsPromise]).then(([agents, leads]) => {
  // Get available agents
  let availableAgents = agents.filter(({ Status }) => Status === 'Available')

  // Prepare to organise agents by ID so as to track and update values easily
  let availableAgentsById = {}
  availableAgents.forEach(agent => availableAgentsById[agent.ID] = agent)

  // Get all the weights and make sure it is a Number
  const weights = Object.values(availableAgentsById).map(({ Weight }) => +Weight)
  let highestWeight = Math.max(...weights) // Get highest weight
  
  const assignments = leads.map(lead => {
    // Check if every agent has the weight of leads
    const isEveryAgentEqual = Object.values(availableAgentsById).every(({ Weight }) => +Weight === highestWeight)

    // Increase highest weight value if all have the same weight
    if (isEveryAgentEqual) {
      highestWeight++
    }

    // Get the first agent that doesn't have the highest weight
    const agentSelected = availableAgents.find(({ Weight }) => +Weight !== highestWeight )

    // Increase agent weight once selected
    availableAgentsById[agentSelected.ID].Weight++
    
    return { leadID: lead.ID, leadName: lead.Name, agent: agentSelected.Name }
  })

  console.log(assignments)
  console.log(availableAgentsById)
})