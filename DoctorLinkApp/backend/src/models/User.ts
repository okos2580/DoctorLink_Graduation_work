import sql from 'mssql';
import bcrypt from 'bcryptjs';
import { getPool } from '../config/database';
import { User, UserRole, UserStatus, UserFilter, PaginationQuery } from '../types';

export class UserModel {
  // 사용자 생성
  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'registrationDate'>): Promise<User> {
    const pool = getPool();
    const request = pool.request();

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const query = `
      INSERT INTO Users (email, password, name, phone, birthDate, gender, address, role, status, profileImage)
      OUTPUT INSERTED.*
      VALUES (@email, @password, @name, @phone, @birthDate, @gender, @address, @role, @status, @profileImage)
    `;

    request.input('email', sql.NVarChar, userData.email);
    request.input('password', sql.NVarChar, hashedPassword);
    request.input('name', sql.NVarChar, userData.name);
    request.input('phone', sql.NVarChar, userData.phone);
    request.input('birthDate', sql.Date, userData.birthDate);
    request.input('gender', sql.NVarChar, userData.gender);
    request.input('address', sql.NVarChar, userData.address || null);
    request.input('role', sql.NVarChar, userData.role || 'patient');
    request.input('status', sql.NVarChar, userData.status || 'active');
    request.input('profileImage', sql.NVarChar, userData.profileImage || null);

    const result = await request.query(query);
    return result.recordset[0];
  }

  // ID로 사용자 찾기
  static async findById(id: string): Promise<User | null> {
    const pool = getPool();
    const request = pool.request();

    const query = `SELECT * FROM Users WHERE id = @id`;
    request.input('id', sql.UniqueIdentifier, id);

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  // 이메일로 사용자 찾기
  static async findByEmail(email: string): Promise<User | null> {
    const pool = getPool();
    const request = pool.request();

    const query = `SELECT * FROM Users WHERE email = @email`;
    request.input('email', sql.NVarChar, email);

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  // 사용자 목록 조회 (필터링 및 페이지네이션)
  static async findMany(
    filter: UserFilter = {},
    pagination: PaginationQuery = {}
  ): Promise<{ users: User[]; total: number }> {
    const pool = getPool();
    const request = pool.request();

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let countWhereClause = 'WHERE 1=1';

    // 필터 조건 추가
    if (filter.role) {
      whereClause += ' AND role = @role';
      countWhereClause += ' AND role = @role';
      request.input('role', sql.NVarChar, filter.role);
    }

    if (filter.status) {
      whereClause += ' AND status = @status';
      countWhereClause += ' AND status = @status';
      request.input('status', sql.NVarChar, filter.status);
    }

    if (filter.searchTerm) {
      whereClause += ' AND (name LIKE @searchTerm OR email LIKE @searchTerm OR phone LIKE @searchTerm)';
      countWhereClause += ' AND (name LIKE @searchTerm OR email LIKE @searchTerm OR phone LIKE @searchTerm)';
      request.input('searchTerm', sql.NVarChar, `%${filter.searchTerm}%`);
    }

    // 전체 개수 조회
    const countQuery = `SELECT COUNT(*) as total FROM Users ${countWhereClause}`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // 사용자 목록 조회
    const query = `
      SELECT * FROM Users 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);
    return { users: result.recordset, total };
  }

  // 사용자 정보 업데이트
  static async update(id: string, updateData: Partial<User>): Promise<User | null> {
    const pool = getPool();
    const request = pool.request();

    const updateFields: string[] = [];
    const allowedFields = ['name', 'phone', 'birthDate', 'gender', 'address', 'status', 'profileImage', 'lastLogin'];

    // 업데이트할 필드 동적 생성
    allowedFields.forEach(field => {
      if (updateData[field as keyof User] !== undefined) {
        updateFields.push(`${field} = @${field}`);
        request.input(field, sql.NVarChar, updateData[field as keyof User]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('업데이트할 필드가 없습니다.');
    }

    const query = `
      UPDATE Users 
      SET ${updateFields.join(', ')}, updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `;

    request.input('id', sql.UniqueIdentifier, id);

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  // 비밀번호 업데이트
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const pool = getPool();
    const request = pool.request();

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = `
      UPDATE Users 
      SET password = @password, updatedAt = GETDATE()
      WHERE id = @id
    `;

    request.input('id', sql.UniqueIdentifier, id);
    request.input('password', sql.NVarChar, hashedPassword);

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  }

  // 사용자 삭제 (소프트 삭제)
  static async delete(id: string): Promise<boolean> {
    const pool = getPool();
    const request = pool.request();

    const query = `
      UPDATE Users 
      SET status = 'inactive', updatedAt = GETDATE()
      WHERE id = @id
    `;

    request.input('id', sql.UniqueIdentifier, id);

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  }

  // 사용자 완전 삭제
  static async hardDelete(id: string): Promise<boolean> {
    const pool = getPool();
    const request = pool.request();

    const query = `DELETE FROM Users WHERE id = @id`;
    request.input('id', sql.UniqueIdentifier, id);

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  }

  // 비밀번호 검증
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // 이메일 중복 확인
  static async isEmailExists(email: string, excludeId?: string): Promise<boolean> {
    const pool = getPool();
    const request = pool.request();

    let query = `SELECT COUNT(*) as count FROM Users WHERE email = @email`;
    request.input('email', sql.NVarChar, email);

    if (excludeId) {
      query += ' AND id != @excludeId';
      request.input('excludeId', sql.UniqueIdentifier, excludeId);
    }

    const result = await request.query(query);
    return result.recordset[0].count > 0;
  }

  // 전화번호 중복 확인
  static async isPhoneExists(phone: string, excludeId?: string): Promise<boolean> {
    const pool = getPool();
    const request = pool.request();

    let query = `SELECT COUNT(*) as count FROM Users WHERE phone = @phone`;
    request.input('phone', sql.NVarChar, phone);

    if (excludeId) {
      query += ' AND id != @excludeId';
      request.input('excludeId', sql.UniqueIdentifier, excludeId);
    }

    const result = await request.query(query);
    return result.recordset[0].count > 0;
  }

  // 역할별 사용자 수 조회
  static async countByRole(): Promise<{ [key in UserRole]: number }> {
    const pool = getPool();
    const request = pool.request();

    const query = `
      SELECT role, COUNT(*) as count 
      FROM Users 
      WHERE status = 'active'
      GROUP BY role
    `;

    const result = await request.query(query);
    
    const counts: { [key in UserRole]: number } = {
      patient: 0,
      doctor: 0,
      admin: 0
    };

    result.recordset.forEach((row: any) => {
      counts[row.role as UserRole] = row.count;
    });

    return counts;
  }

  // 최근 가입한 사용자 조회
  static async getRecentUsers(limit: number = 10): Promise<User[]> {
    const pool = getPool();
    const request = pool.request();

    const query = `
      SELECT TOP (@limit) * 
      FROM Users 
      WHERE status = 'active'
      ORDER BY registrationDate DESC
    `;

    request.input('limit', sql.Int, limit);

    const result = await request.query(query);
    return result.recordset;
  }

  // 마지막 로그인 시간 업데이트
  static async updateLastLogin(id: string): Promise<boolean> {
    const pool = getPool();
    const request = pool.request();

    const query = `
      UPDATE Users 
      SET lastLogin = GETDATE(), updatedAt = GETDATE()
      WHERE id = @id
    `;

    request.input('id', sql.UniqueIdentifier, id);

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  }
}
