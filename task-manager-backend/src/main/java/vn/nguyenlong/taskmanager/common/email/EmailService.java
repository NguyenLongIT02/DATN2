package vn.nguyenlong.taskmanager.common.email;

public interface EmailService {

    void sendBoardInvite(String toEmail, String boardName, String invitedByName, String acceptLink, long hoursToExpire);

    void sendAddedToBoard(String toEmail, String boardName, String invitedByName);
}


