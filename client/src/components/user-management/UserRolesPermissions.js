import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaUserShield, FaUserCog, FaUserEdit, FaEye, FaLock, FaCheck, FaTimes, 
  FaFilter, FaSave, FaPlus, FaUserPlus, FaUserMinus, FaChevronDown, FaChevronUp, 
  FaEllipsisV, FaCalendarAlt, FaIdBadge, FaBuilding, FaInfoCircle } from 'react-icons/fa';
import { AdminSideBar } from '../dashboard/AdminDashboard';

const UserRolesPermissions = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      department: 'IT',
      lastActive: '2023-08-15T10:30:00',
      permissions: {
        createUser: true,
        editUser: true,
        deleteUser: true,
        viewReports: true,
        manageRoles: true
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'User',
      department: 'HR',
      lastActive: '2023-08-14T14:45:00',
      permissions: {
        createUser: false,
        editUser: false,
        deleteUser: false,
        viewReports: true,
        manageRoles: false
      }
    },
    {
      id: 3,
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      role: 'Moderator',
      department: 'Finance',
      lastActive: '2023-08-13T09:15:00',
      permissions: {
        createUser: false,
        editUser: true,
        deleteUser: false,
        viewReports: true,
        manageRoles: true
      }
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      role: 'Manager',
      department: 'Marketing',
      lastActive: '2023-08-12T16:20:00',
      permissions: {
        createUser: true,
        editUser: true,
        deleteUser: false,
        viewReports: true,
        manageRoles: false
      }
    }
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [filterRole, setFilterRole] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const roles = ['Admin', 'User', 'Moderator', 'Manager'];
  const permissions = [
    { id: 'createUser', label: 'Create User', icon: <FaUserPlus /> },
    { id: 'editUser', label: 'Edit User', icon: <FaUserEdit /> },
    { id: 'deleteUser', label: 'Delete User', icon: <FaUserMinus /> },
    { id: 'viewReports', label: 'View Reports', icon: <FaEye /> },
    { id: 'manageRoles', label: 'Manage Roles', icon: <FaUserShield /> }
  ];

  // Stats calculation
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
    moderatorCount: 0,
    managerCount: 0
  });

  useEffect(() => {
    // Calculate stats
    const newStats = {
      totalUsers: users.length,
      adminCount: users.filter(user => user.role === 'Admin').length,
      userCount: users.filter(user => user.role === 'User').length,
      moderatorCount: users.filter(user => user.role === 'Moderator').length,
      managerCount: users.filter(user => user.role === 'Manager').length
    };
    setStats(newStats);
  }, [users]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (isMobileView) {
      // Scroll to user details on mobile
      setTimeout(() => {
        document.getElementById('userDetails')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, role: newRole }
          : user
      )
    );
    setNotification({
      type: 'success',
      message: 'User role updated successfully!'
    });
    
    // Auto-dismiss notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handlePermissionChange = (userId, permissionId, value) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? {
              ...user,
              permissions: {
                ...user.permissions,
                [permissionId]: value
              }
            }
          : user
      )
    );
    setNotification({
      type: 'success',
      message: 'User permissions updated successfully!'
    });
    
    // Auto-dismiss notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSaveChanges = () => {
    // Here you would typically make an API call to save the changes
    setNotification({
      type: 'success',
      message: 'All changes saved successfully!'
    });
    
    // Auto-dismiss notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleFilterChange = (role) => {
    setFilterRole(role);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Apply filtering and sorting
  let filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterRole === 'All' || user.role === filterRole)
  );

  // Apply sorting
  filteredUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div style={{ display: "flex" }}>
    <AdminSideBar/>
    <Container>
      <Header>
        <HeaderContent>
          <Title>User Roles and Permissions</Title>
          <StatsContainer>
            <StatCard>
              <StatValue>{stats.totalUsers}</StatValue>
              <StatLabel>Total Users</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.adminCount}</StatValue>
              <StatLabel>Admins</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.userCount}</StatValue>
              <StatLabel>Users</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.moderatorCount}</StatValue>
              <StatLabel>Moderators</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.managerCount}</StatValue>
              <StatLabel>Managers</StatLabel>
            </StatCard>
          </StatsContainer>
        </HeaderContent>
      </Header>

      <ControlsContainer>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchContainer>
        
        {isMobileView ? (
          <MobileFilterToggle onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <FilterIcon /> Filters {showMobileFilters ? <FaChevronUp /> : <FaChevronDown />}
          </MobileFilterToggle>
        ) : null}
        
        <FilterContainer show={!isMobileView || showMobileFilters}>
          <FilterLabel><FilterIcon /> Filter by Role:</FilterLabel>
          <FilterButtons>
            <FilterButton 
              active={filterRole === 'All'} 
              onClick={() => handleFilterChange('All')}
            >
              All
            </FilterButton>
            {roles.map(role => (
              <FilterButton 
                key={role} 
                active={filterRole === role} 
                onClick={() => handleFilterChange(role)}
                roleColor={getRoleColor(role)}
              >
                {role}
              </FilterButton>
            ))}
          </FilterButtons>
        </FilterContainer>
      </ControlsContainer>

      {notification && (
        <NotificationBar type={notification.type}>
          {notification.type === 'success' ? <FaCheck /> : <FaTimes />}
          {notification.message}
        </NotificationBar>
      )}

      <ContentContainer>
        <UsersListContainer>
          <TableHeader>
            <TableHeaderCell onClick={() => handleSort('name')}>
              Name
              {sortConfig.key === 'name' && (
                <SortIndicator direction={sortConfig.direction} />
              )}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('email')}>
              Email
              {sortConfig.key === 'email' && (
                <SortIndicator direction={sortConfig.direction} />
              )}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('role')}>
              Role
              {sortConfig.key === 'role' && (
                <SortIndicator direction={sortConfig.direction} />
              )}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('department')}>
              Department
              {sortConfig.key === 'department' && (
                <SortIndicator direction={sortConfig.direction} />
              )}
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('lastActive')}>
              Last Active
              {sortConfig.key === 'lastActive' && (
                <SortIndicator direction={sortConfig.direction} />
              )}
            </TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TableRow
                  key={user.id}
                  selected={selectedUser?.id === user.id}
                  onClick={() => handleUserSelect(user)}
                >
                  <TableCell data-label="Name">
                    <UserAvatar small>{user.name.charAt(0)}</UserAvatar>
                    <span>{user.name}</span>
                  </TableCell>
                  <TableCell data-label="Email">{user.email}</TableCell>
                  <TableCell data-label="Role">
                    <RoleBadge role={user.role}>
                      {user.role}
                    </RoleBadge>
                  </TableCell>
                  <TableCell data-label="Department">{user.department}</TableCell>
                  <TableCell data-label="Last Active">{formatDate(user.lastActive)}</TableCell>
                  <TableCell>
                    <EditButton onClick={(e) => {
                      e.stopPropagation();
                      handleUserSelect(user);
                    }}>
                      <FaUserCog /> {!isMobileView && 'Edit'}
                    </EditButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyState>
                <FaInfoCircle size={32} />
                <p>No users found matching your search criteria.</p>
                <ResetButton onClick={() => {
                  setSearchTerm('');
                  setFilterRole('All');
                }}>
                  Reset Filters
                </ResetButton>
              </EmptyState>
            )}
          </TableBody>
        </UsersListContainer>

        {selectedUser && (
          <UserDetailsContainer id="userDetails">
            {isMobileView && (
              <BackButton onClick={() => setSelectedUser(null)}>
                &larr; Back to Users
              </BackButton>
            )}
            <DetailsHeader>
              <UserAvatar>
                {selectedUser.name.charAt(0)}
              </UserAvatar>
              <UserInfo>
                <UserName>{selectedUser.name}</UserName>
                <UserEmail>{selectedUser.email}</UserEmail>
                <UserMeta>
                  <MetaItem>
                    <FaIdBadge /> ID: {selectedUser.id}
                  </MetaItem>
                  <MetaItem>
                    <FaBuilding /> {selectedUser.department}
                  </MetaItem>
                  <MetaItem>
                    <FaCalendarAlt /> {formatDate(selectedUser.lastActive)}
                  </MetaItem>
                </UserMeta>
              </UserInfo>
            </DetailsHeader>

            <SectionTitle>
              <FaUserShield /> Role Assignment
            </SectionTitle>
            <RoleSelector
              value={selectedUser.role}
              onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </RoleSelector>

            <SectionTitle>
              <FaLock /> Permissions
            </SectionTitle>
            <PermissionsGrid>
              {permissions.map(permission => (
                <PermissionItem key={permission.id}>
                  <PermissionLabel>
                    <PermissionCheckbox
                      type="checkbox"
                      checked={selectedUser.permissions[permission.id]}
                      onChange={(e) => handlePermissionChange(
                        selectedUser.id,
                        permission.id,
                        e.target.checked
                      )}
                    />
                    <PermissionIcon>
                      {permission.icon}
                    </PermissionIcon>
                    <span>{permission.label}</span>
                  </PermissionLabel>
                </PermissionItem>
              ))}
            </PermissionsGrid>

            <ActionSection>
              <SaveButton onClick={handleSaveChanges}>
                <FaSave /> Save Changes
              </SaveButton>
            </ActionSection>
          </UserDetailsContainer>
        )}
      </ContentContainer>
    </Container>
    </div>
  );
};

// Helper function to get role colors
const getRoleColor = (role) => {
  switch (role) {
    case 'Admin':
      return '#dc3545';
    case 'User':
      return '#28a745';
    case 'Moderator':
      return '#ffc107';
    case 'Manager':
      return '#17a2b8';
    default:
      return '#6c757d';
  }
};

// Sort indicator component
const SortIndicator = ({ direction }) => (
  <SortIcon>
    {direction === 'ascending' ? <FaChevronUp /> : <FaChevronDown />}
  </SortIcon>
);

// Styled Components
const Container = styled.div`
  padding: 0;
  background-color: #F8F9FA;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #2C3E50 0%, #4C9F9F 100%);
  color: white;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    transform: rotate(30deg);
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  margin: 0 0 1.5rem 0;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem 1rem;
  text-align: center;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
`;

const ControlsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 0 1rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 3px rgba(76, 159, 159, 0.2);
  }
`;

const MobileFilterToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #4C9F9F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3a8a8a;
  }
`;

const FilterContainer = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-top: 0.5rem;
    animation: slideDown 0.3s ease-out;
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const FilterLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #2C3E50;
`;

const FilterIcon = styled(FaFilter)`
  color: #4C9F9F;
`;

const FilterButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const FilterButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 20px;
  background-color: ${props => props.active ? (props.roleColor || '#4C9F9F') : '#e9ecef'};
  color: ${props => props.active ? 'white' : '#495057'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.active ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    background-color: ${props => props.active ? (props.roleColor ? props.roleColor + '99' : '#2A6F6F') : '#dee2e6'};
    transform: ${props => props.active ? 'translateY(-2px)' : 'none'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const NotificationBar = styled.div`
  max-width: 1200px;
  margin: 0 auto 1.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  animation: slideIn 0.3s ease-out;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background-color: ${props => props.type === 'success' ? '#28a745' : '#dc3545'};
    animation: shrink 3s linear forwards;
    width: 100%;
  }
  
  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  @media (max-width: 768px) {
    margin: 0 1rem 1.5rem;
    padding: 1rem;
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
`;

const UsersListContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1fr 1.5fr 1fr;
  background-color: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 10;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1.5fr 2fr 1fr 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableHeaderCell = styled.div`
  padding: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e9ecef;
  }
  
  @media (max-width: 1200px) {
    &:nth-child(4) {
      display: none;
    }
  }
`;

const SortIcon = styled.span`
  margin-left: 8px;
  display: flex;
  align-items: center;
  color: #4C9F9F;
`;

const TableBody = styled.div`
  max-height: 600px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
  
  @media (max-width: 768px) {
    max-height: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1fr 1.5fr 1fr;
  border-bottom: 1px solid #eee;
  background-color: ${props => props.selected ? '#e3f2fd' : 'white'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.selected ? '#e3f2fd' : '#f8f9fa'};
    cursor: pointer;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 1.5fr 2fr 1fr 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    position: relative;
    border-left: 4px solid ${props => props.selected ? '#4C9F9F' : 'transparent'};
    margin-bottom: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border-radius: 0 8px 8px 0;
    
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }
`;

const TableCell = styled.div`
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 1200px) {
    &:nth-child(4) {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 0;
    
    &:nth-child(4) {
      display: flex;
    }
    
    &:not(:first-child):before {
      content: attr(data-label);
      font-weight: 600;
      margin-right: 0.5rem;
      min-width: 100px;
      color: #6c757d;
    }
  }
`;

const RoleBadge = styled.span`
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: ${props => getRoleColor(props.role)};
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    margin-left: auto;
  }
`;

const EditButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: #4C9F9F;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #2A6F6F;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const EmptyState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #6c757d;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
`;

const ResetButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: #e9ecef;
  color: #495057;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #dee2e6;
  }
`;

const UserDetailsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 1.5rem;
    margin-top: 1rem;
  }
`;

const BackButton = styled.button`
  padding: 0.5rem 0;
  background: none;
  border: none;
  color: #4C9F9F;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const DetailsHeader = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const UserAvatar = styled.div`
  width: ${props => props.small ? '40px' : '80px'};
  height: ${props => props.small ? '40px' : '80px'};
  border-radius: 50%;
  background: linear-gradient(135deg, #4C9F9F 0%, #2C3E50 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.small ? '1.2rem' : '2rem'};
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const UserName = styled.h2`
  margin: 0;
  color: #2C3E50;
  font-size: 1.5rem;
  font-weight: 600;
`;

const UserEmail = styled.p`
  color: #6c757d;
  margin: 0.5rem 0 0;
  font-size: 1rem;
`;

const UserMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #6c757d;
  
  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #4C9F9F;
  }
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: #2C3E50;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #4C9F9F;
  }
  
  &:after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #e9ecef;
    margin-left: 0.75rem;
  }
`;

const RoleSelector = styled.select`
  width: 100%;
  padding: 0.85rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  color: #2C3E50;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%234C9F9F' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: calc(100% - 1rem) center;
  padding-right: 2.5rem;
  
  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 3px rgba(76, 159, 159, 0.2);
  }
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: center;
`;

const PermissionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 100%;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const PermissionCheckbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4C9F9F;
`;

const PermissionIcon = styled.span`
  color: #4C9F9F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  
  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const SaveButton = styled.button`
  padding: 0.85rem 1.75rem;
  background-color: #4C9F9F;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #2A6F6F;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default UserRolesPermissions;