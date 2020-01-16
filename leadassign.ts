const [_, __, leadsCSV, agentsCSV] = process.argv
const csv = require('csvtojson')

interface Agent {
  ID: string
  Name: string
  Status: string
  Weight: number
}

interface Lead {
  ID: string
  Email: string
  Name: string
}

interface Assignment {
  leadID: string
  leadName: string
  agent: String
}

const agentsPromise: Promise<Agent[]> = csv().fromFile(agentsCSV)
const leadsPromise: Promise<Lead[]> = csv().fromFile(leadsCSV)

Promise.all([agentsPromise, leadsPromise]).then(([agents, leads]: [Agent[], Lead[]]) => {
  // Get available agents
  const availableAgents: Agent[] = agents
    .filter(({ Status }: { Status: string }) => Status === 'Available')
    .map((agent: Agent) => {
      agent.Weight = +agent.Weight
      return agent
    })

  // Get index of last agent in the available agents list
  const lastAvailableAgentIndex: number = availableAgents.length - 1

  let agentSelected: Agent = availableAgents[0],
  { Weight: agentSelectedWeight }: { Weight: number } = agentSelected,
  agentSelectedIndex: number = 0,
  nextAgentIndex: number = 1;
  const assignments: Assignment[] = leads.map((lead: Lead) => {
    if (!agentSelectedWeight) {
      agentSelected = availableAgents[nextAgentIndex]
      const { Weight } = agentSelected
      agentSelectedWeight = Weight
      agentSelectedIndex = availableAgents.findIndex((agent: Agent) => agent.ID === agentSelected.ID)
      nextAgentIndex = (lastAvailableAgentIndex === agentSelectedIndex) ? 0 : (agentSelectedIndex + 1)
    }

    agentSelectedWeight--

    return { leadID: lead.ID, leadName: lead.Name, agent: agentSelected.Name }
  })

  console.log(assignments)
})