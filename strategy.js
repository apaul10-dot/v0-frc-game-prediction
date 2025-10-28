// Strategy page functionality
function checkAuth() {
    // Placeholder for authentication check
    console.log('Checking authentication...');
}

window.addEventListener('DOMContentLoaded', async () => {
    await loadTopTeams();
});

async function analyzeStrategy(event) {
    event.preventDefault();
    
    const teamNumbers = document.getElementById('strategyTeams').value
        .split(',')
        .map(t => t.trim());
    
    try {
        // Get data for all teams
        const teamsData = await Promise.all(
            teamNumbers.map(async (teamNum) => {
                const team = await getTeam(teamNum);
                const performanceData = await getTeamPerformanceData(teamNum);
                
                let stats = { avgScore: 0, winRate: 0, totalMatches: 0 };
                if (performanceData.length > 0) {
                    const allMatches = performanceData.flatMap(event => event.matches);
                    stats = calculateTeamStats(allMatches, teamNum);
                }
                
                return {
                    number: teamNum,
                    nickname: team.nickname,
                    ...stats
                };
            })
        );
        
        // Calculate alliance strength
        const totalAvgScore = teamsData.reduce((sum, team) => sum + parseFloat(team.avgScore), 0);
        const avgWinRate = teamsData.reduce((sum, team) => sum + parseFloat(team.winRate), 0) / teamsData.length;
        
        // Display results
        document.getElementById('strategyResults').style.display = 'block';
        document.getElementById('strategyContent').innerHTML = `
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #A78BFA; margin-bottom: 1rem;">Alliance Strength Analysis</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="stat-card">
                        <span class="stat-value">${totalAvgScore.toFixed(1)}</span>
                        <span class="stat-label">Combined Avg Score</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${avgWinRate.toFixed(1)}%</span>
                        <span class="stat-label">Average Win Rate</span>
                    </div>
                </div>
            </div>
            
            <h3 style="color: #A78BFA; margin-bottom: 1rem;">Team Breakdown</h3>
            <div style="display: grid; gap: 1rem;">
                ${teamsData.map(team => `
                    <div style="padding: 1.5rem; background: rgba(167, 139, 250, 0.05); border-radius: 15px; border: 1px solid rgba(167, 139, 250, 0.2);">
                        <h4 style="color: #fff; margin-bottom: 0.5rem;">Team ${team.number} - ${team.nickname}</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                            <div>
                                <span style="color: #9CA3AF; font-size: 0.85rem;">Avg Score</span>
                                <p style="color: #A78BFA; font-weight: 600; font-size: 1.25rem;">${team.avgScore}</p>
                            </div>
                            <div>
                                <span style="color: #9CA3AF; font-size: 0.85rem;">Win Rate</span>
                                <p style="color: #A78BFA; font-weight: 600; font-size: 1.25rem;">${team.winRate}%</p>
                            </div>
                            <div>
                                <span style="color: #9CA3AF; font-size: 0.85rem;">Matches</span>
                                <p style="color: #A78BFA; font-weight: 600; font-size: 1.25rem;">${team.totalMatches}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(167, 139, 250, 0.1); border-radius: 15px;">
                <h4 style="color: #A78BFA; margin-bottom: 0.5rem;">Strategy Recommendation</h4>
                <p style="color: #E5E7EB; line-height: 1.6;">
                    ${generateStrategyRecommendation(teamsData, avgWinRate)}
                </p>
            </div>
        `;
        
    } catch (error) {
        console.error('Error analyzing strategy:', error);
        alert('Error analyzing strategy. Please check team numbers and try again.');
    }
}

function generateStrategyRecommendation(teams, avgWinRate) {
    if (avgWinRate > 70) {
        return 'This is a strong alliance! Focus on consistent performance and communication. Your combined scoring potential is high, so prioritize defensive strategies to maintain your advantage.';
    } else if (avgWinRate > 50) {
        return 'This alliance has solid potential. Work on maximizing each team\'s strengths and covering weaknesses. Consider practicing coordination for autonomous and endgame phases.';
    } else {
        return 'This alliance will need strategic planning. Focus on identifying each team\'s best capabilities and creating a complementary strategy. Consider aggressive scoring in areas where you have advantages.';
    }
}

async function loadTopTeams() {
    const container = document.getElementById('topTeams');
    
    try {
        const topTeamNumbers = [254, 1678, 971, 1323, 2056];
        const teamsData = await Promise.all(
            topTeamNumbers.map(async (teamNum) => {
                const team = await getTeam(teamNum);
                const performanceData = await getTeamPerformanceData(teamNum);
                
                let stats = { avgScore: 0, winRate: 0 };
                if (performanceData.length > 0) {
                    const allMatches = performanceData.flatMap(event => event.matches);
                    stats = calculateTeamStats(allMatches, teamNum);
                }
                
                return {
                    number: teamNum,
                    nickname: team.nickname,
                    ...stats
                };
            })
        );
        
        // Sort by win rate
        teamsData.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
        
        container.innerHTML = teamsData.map((team, index) => `
            <div style="padding: 1rem; background: rgba(167, 139, 250, 0.05); border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="color: #A78BFA; font-weight: 700; font-size: 1.25rem;">#${index + 1}</span>
                    <span style="color: #fff; margin-left: 1rem; font-weight: 600;">Team ${team.number}</span>
                    <span style="color: #9CA3AF; margin-left: 0.5rem;">${team.nickname}</span>
                </div>
                <div style="text-align: right;">
                    <div style="color: #A78BFA; font-weight: 600;">${team.winRate}% Win Rate</div>
                    <div style="color: #9CA3AF; font-size: 0.85rem;">Avg: ${team.avgScore}</div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading top teams:', error);
        container.innerHTML = '<p class="loading">Error loading top teams</p>';
    }
}

// Placeholder functions for undeclared variables
async function getTeam(teamNum) {
    // Placeholder for fetching team data
    return { number: teamNum, nickname: `Team ${teamNum}` };
}

async function getTeamPerformanceData(teamNum) {
    // Placeholder for fetching team performance data
    return [{ matches: [{ score: 50 }, { score: 60 }] }];
}

function calculateTeamStats(matches, teamNum) {
    // Placeholder for calculating team stats
    const totalScore = matches.reduce((sum, match) => sum + match.score, 0);
    const winRate = 0.5; // Placeholder win rate
    const totalMatches = matches.length;
    return { avgScore: (totalScore / totalMatches).toFixed(1), winRate: (winRate * 100).toFixed(1), totalMatches };
}
