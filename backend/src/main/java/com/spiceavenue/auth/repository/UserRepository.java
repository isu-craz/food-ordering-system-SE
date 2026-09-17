package com.spiceavenue.auth.repository;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.common.enums.RiderStatus;
import com.spiceavenue.common.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    List<User> findByRole(UserRole role);
    List<User> findByRoleAndRiderStatus(UserRole role, RiderStatus riderStatus);
    List<User> findByBranch_BranchId(Long branchId);
    List<User> findByRoleAndBranch_BranchId(UserRole role, Long branchId);
}
