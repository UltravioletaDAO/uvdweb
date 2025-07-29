const SNAPSHOT_API_URL = "https://hub.snapshot.org/graphql";

const SPACE_QUERY = `
  query Space($spaceId: String!) {
    space(id: $spaceId) {
      id
      name
      followersCount
      proposalsCount
      about
      avatar
    }
  }
`;

const LEADERBOARD_QUERY = `
  query Leaderboard($space: String!) {
    leaderboards(
      first: 5
      where: { space: $space }
      orderBy: "votesCount"
      orderDirection: desc
    ) {
      user
      space
      proposalsCount
      votesCount
    }
  }
`;

const PROPOSALS_QUERY = `
  query Proposals($spaceId: String!, $first: Int!) {
    proposals(
      first: $first
      where: { space_in: [$spaceId] }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      title
      body
      choices
      scores
      scores_total
      quorum
      state
      created
      end
      snapshot
      votes
      link
    }
  }
`;

async function fetchSnapshotData(query, variables) {
  try {
    const response = await fetch(SNAPSHOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Snapshot data:', error);
    throw error;
  }
}

export async function getSnapshotData(spaceId) {
  try {
    const [spaceResult, proposalsResult, leaderboardResult] = await Promise.all([
      fetchSnapshotData(SPACE_QUERY, { spaceId }),
      fetchSnapshotData(PROPOSALS_QUERY, { spaceId, first: 1000 }),
      fetchSnapshotData(LEADERBOARD_QUERY, { space: spaceId })
    ]);

    return {
      space: spaceResult.space,
      proposals: proposalsResult.proposals,
      leaderboard: leaderboardResult.leaderboards,
    };
  } catch (error) {
    throw error;
  }
}