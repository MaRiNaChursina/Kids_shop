import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function GroupSelector() {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        fetch('/admin/groups')
            .then(res => res.json())
            .then(setGroups);
    }, []);

    return (
        <div>
            {groups.map(g => (
                <Link key={g.id} to={`/groups/${g.id}`}>
                    {g.name}
                </Link>
            ))}
        </div>
    );
}
